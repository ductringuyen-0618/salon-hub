package com.salonhub.api.queue.service;

import com.salonhub.api.appointment.model.Appointment;
import com.salonhub.api.appointment.model.ServiceType;
import com.salonhub.api.appointment.repository.AppointmentRepository;
import com.salonhub.api.appointment.repository.ServiceTypeRepository;
import com.salonhub.api.settings.service.BusinessSettingsService;
import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.employee.model.Role;
import com.salonhub.api.employee.repository.EmployeeRepository;
import com.salonhub.api.queue.model.Queue;
import com.salonhub.api.queue.model.QueueStatus;
import com.salonhub.api.queue.repository.QueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Estimates when a walk-in will be seen, accounting for:
 *   1. Real per-service durations from queue.service_type_id (falls back to
 *      a default for unspecified services).
 *   2. The number of technicians on shift (parallel capacity).
 *   3. IN_PROGRESS queue entries (those techs are busy mid-service).
 *   4. Upcoming scheduled appointments (techs blocked at specific times).
 *   5. Customer preferred-technician routing — a customer who requested
 *      Lisa waits for Lisa even if Maria becomes free sooner.
 *   6. A configurable turnover buffer between back-to-back walk-ins so a
 *      tech has time to clean their station.
 *   7. Salon business hours — wait time that would extend past closing
 *      rolls over to the next open day's opening time.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WaitTimeEstimator {

    private final QueueRepository queueRepository;
    private final EmployeeRepository employeeRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final BusinessSettingsService businessSettings;

    /** Used when a queue entry doesn't carry a serviceTypeId. */
    public static final int DEFAULT_SERVICE_MINUTES = 30;

    /** Returned when no employees are on shift today. */
    public static final int NO_STAFF_FALLBACK_MINUTES = 60;

    /** How far ahead we scan a technician's appointment book. */
    public static final int APPOINTMENT_WINDOW_HOURS = 12;

    /** Public entry: how long would a brand-new walk-in wait? */
    public int estimateForNewArrival() {
        return estimateForNewArrival(LocalDateTime.now(), null, null);
    }

    /**
     * Public entry with the customer's chosen service + preferred tech, so
     * the estimate they see at submission matches what they'll actually wait.
     */
    public int estimateForNewArrival(Long serviceTypeId, Long preferredTechId) {
        return estimateForNewArrival(LocalDateTime.now(), serviceTypeId, preferredTechId);
    }

    int estimateForNewArrival(LocalDateTime now, Long newServiceId, Long newPreferredTechId) {
        Map<Long, LocalDateTime> techFreeAt = buildTechFreeAtMap(now);
        if (techFreeAt.isEmpty()) {
            return NO_STAFF_FALLBACK_MINUTES;
        }

        // Drain existing WAITING queue first using each entry's real
        // service duration + preferred tech preference.
        for (Queue q : queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)) {
            assignOne(techFreeAt, durationFor(q), q.getEmployeeId());
        }

        int newCustomerDuration = durationForServiceId(newServiceId);
        LocalDateTime pickupAt = pickupTimeFor(techFreeAt, newPreferredTechId);
        if (pickupAt == null) return NO_STAFF_FALLBACK_MINUTES;

        // Clamp to salon business hours.
        pickupAt = clampToBusinessHours(pickupAt, newCustomerDuration);

        long minutes = Math.max(0, Duration.between(now, pickupAt).toMinutes());
        return (int) minutes;
    }

    /** Recompute position + estimatedWaitTime for every WAITING entry. */
    public List<Queue> recalculateWaitingQueue() {
        return recalculateWaitingQueue(LocalDateTime.now());
    }

    List<Queue> recalculateWaitingQueue(LocalDateTime now) {
        Map<Long, LocalDateTime> techFreeAt = buildTechFreeAtMap(now);
        List<Queue> waiting = queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING);

        if (techFreeAt.isEmpty()) {
            int idx = 1;
            for (Queue q : waiting) {
                q.setPosition(idx);
                q.setEstimatedWaitTime(NO_STAFF_FALLBACK_MINUTES * idx);
                idx++;
            }
            return waiting;
        }

        int position = 1;
        for (Queue q : waiting) {
            int duration = durationFor(q);
            LocalDateTime pickupAt = pickupTimeFor(techFreeAt, q.getEmployeeId());
            if (pickupAt == null) {
                // Preferred tech doesn't exist anymore — fall back to any.
                pickupAt = Collections.min(techFreeAt.values());
                q.setEmployeeId(null);
            }
            pickupAt = clampToBusinessHours(pickupAt, duration);
            long mins = Math.max(0, Duration.between(now, pickupAt).toMinutes());
            q.setEstimatedWaitTime((int) mins);
            q.setPosition(position++);
            assignOne(techFreeAt, duration, q.getEmployeeId());
        }
        return waiting;
    }

    /* ----------------- scheduling internals ----------------- */

    private Map<Long, LocalDateTime> buildTechFreeAtMap(LocalDateTime now) {
        List<Employee> techs = employeeRepository.findAll().stream()
                .filter(Employee::isAvailable)
                .filter(e -> e.getRole() != Role.FRONT_DESK)
                .toList();

        Map<Long, LocalDateTime> map = new HashMap<>();
        for (Employee t : techs) map.put(t.getId(), now);
        if (map.isEmpty()) return map;

        // IN_PROGRESS work blocks the tech.
        for (Queue q : queueRepository.findByStatus(QueueStatus.IN_PROGRESS)) {
            Long empId = q.getEmployeeId();
            if (empId == null || !map.containsKey(empId)) continue;
            LocalDateTime startedAt = q.getUpdatedAt() != null ? q.getUpdatedAt() : now;
            LocalDateTime done = startedAt.plusMinutes(durationFor(q));
            if (done.isAfter(map.get(empId))) map.put(empId, done);
        }

        // Upcoming appointments block the tech.
        LocalDateTime windowEnd = now.plusHours(APPOINTMENT_WINDOW_HOURS);
        for (Long empId : map.keySet()) {
            List<Appointment> appts = appointmentRepository
                    .findByEmployeeIdAndStartTimeBetween(empId, now, windowEnd);
            for (Appointment a : appts) {
                int dur = totalDurationOf(a);
                LocalDateTime apptEnd = a.getStartTime().plusMinutes(dur);
                LocalDateTime currentFree = map.get(empId);
                if (a.getStartTime().isBefore(currentFree.plusMinutes(DEFAULT_SERVICE_MINUTES))
                        && apptEnd.isAfter(currentFree)) {
                    map.put(empId, apptEnd);
                }
            }
        }
        return map;
    }

    /**
     * Where would this customer (with optional preferredTechId) be picked
     * up next? Returns null if they want a tech who isn't on the roster.
     */
    private LocalDateTime pickupTimeFor(Map<Long, LocalDateTime> techFreeAt, Long preferredTechId) {
        if (preferredTechId != null) {
            return techFreeAt.get(preferredTechId); // null if not on shift
        }
        return Collections.min(techFreeAt.values());
    }

    /**
     * Assign this customer to the appropriate tech and push that tech's
     * free_at forward by serviceMinutes + turnoverBuffer.
     */
    private void assignOne(Map<Long, LocalDateTime> techFreeAt, int serviceMinutes, Long preferredTechId) {
        int buffer = businessSettings.getTurnoverMinutes();
        if (preferredTechId != null && techFreeAt.containsKey(preferredTechId)) {
            techFreeAt.put(preferredTechId,
                    techFreeAt.get(preferredTechId).plusMinutes(serviceMinutes + buffer));
            return;
        }
        Map.Entry<Long, LocalDateTime> earliest = techFreeAt.entrySet().stream()
                .min(Comparator.comparing(Map.Entry::getValue))
                .orElse(null);
        if (earliest == null) return;
        techFreeAt.put(earliest.getKey(),
                earliest.getValue().plusMinutes(serviceMinutes + buffer));
    }

    /**
     * If `pickupAt` falls outside salon hours OR the service wouldn't fit
     * before closing, roll forward to the next open day's opening time.
     * Hours are looked up per weekday from BusinessSettingsService — Sunday
     * can have different hours from Monday, individual days can be marked
     * closed, all editable from the admin console.
     */
    private LocalDateTime clampToBusinessHours(LocalDateTime pickupAt, int serviceMinutes) {
        for (int hops = 0; hops < 14; hops++) {
            LocalDate day = pickupAt.toLocalDate();
            var hours = businessSettings.getHoursFor(day.getDayOfWeek());

            if (hours != null) {
                LocalDateTime openAt = LocalDateTime.of(day, hours.open());
                LocalDateTime closeAt = LocalDateTime.of(day, hours.close());
                if (pickupAt.isBefore(openAt)) {
                    pickupAt = openAt;
                }
                LocalDateTime serviceEnd = pickupAt.plusMinutes(serviceMinutes);
                if (!serviceEnd.isAfter(closeAt) && !pickupAt.isAfter(closeAt)) {
                    return pickupAt;
                }
            }
            // Closed today OR wouldn't fit — roll to tomorrow's open.
            // We re-loop so we look up the NEXT day's settings (which might
            // also be closed, so we keep rolling).
            LocalDate next = day.plusDays(1);
            pickupAt = LocalDateTime.of(next, java.time.LocalTime.of(0, 0));
        }
        return pickupAt;
    }

    private int durationFor(Queue q) {
        return durationForServiceId(q.getServiceTypeId());
    }

    private int durationForServiceId(Long serviceTypeId) {
        if (serviceTypeId == null) return DEFAULT_SERVICE_MINUTES;
        return serviceTypeRepository.findById(serviceTypeId)
                .map(ServiceType::getEstimatedDurationMinutes)
                .filter(m -> m != null && m > 0)
                .orElse(DEFAULT_SERVICE_MINUTES);
    }

    private int totalDurationOf(Appointment a) {
        if (a.getServices() == null || a.getServices().isEmpty()) {
            return DEFAULT_SERVICE_MINUTES * 2;
        }
        int total = a.getServices().stream()
                .mapToInt(ServiceType::getEstimatedDurationMinutes)
                .sum();
        return total > 0 ? total : DEFAULT_SERVICE_MINUTES * 2;
    }
}
