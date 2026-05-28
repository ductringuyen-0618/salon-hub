package com.salonhub.api.queue.service;

import com.salonhub.api.appointment.model.Appointment;
import com.salonhub.api.appointment.model.ServiceType;
import com.salonhub.api.appointment.repository.AppointmentRepository;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Estimates how long a walk-in will wait, accounting for:
 *   - the number of technicians on shift (parallel capacity)
 *   - IN_PROGRESS queue entries (techs busy until current service ends)
 *   - upcoming scheduled appointments (techs blocked at specific times)
 *   - the existing WAITING queue (drained in order against the available techs)
 *
 * The simulation works in minutes. For each tech we keep a "free_at"
 * timestamp. We seed it from now, push it forward for any IN_PROGRESS or
 * imminent appointment, then walk the WAITING queue in arrival order,
 * assigning each customer to the tech with the earliest free_at. A new
 * walk-in joining the back of the queue gets the FINAL min(free_at) — i.e.
 * how long until the first tech finishes everything ahead of them.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WaitTimeEstimator {

    private final QueueRepository queueRepository;
    private final EmployeeRepository employeeRepository;
    private final AppointmentRepository appointmentRepository;

    /** Default per-customer service time when the queue entry has no
     *  specific service attached (walk-ins don't carry service IDs today). */
    public static final int DEFAULT_SERVICE_MINUTES = 30;

    /** Generous fallback when no techs are on shift (closed / no staff). */
    public static final int NO_STAFF_FALLBACK_MINUTES = 60;

    /** Look this far forward when scanning a tech's appointment book. */
    public static final int APPOINTMENT_WINDOW_HOURS = 12;

    /**
     * Estimate the wait, in minutes, for a brand-new walk-in joining the
     * back of the queue right now. Always >= 0.
     */
    public int estimateForNewArrival() {
        return estimateForNewArrival(LocalDateTime.now());
    }

    int estimateForNewArrival(LocalDateTime now) {
        Map<Long, LocalDateTime> techFreeAt = buildTechFreeAtMap(now);
        if (techFreeAt.isEmpty()) {
            return NO_STAFF_FALLBACK_MINUTES;
        }

        // Drain the existing WAITING queue first.
        List<Queue> waiting = queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING);
        for (Queue q : waiting) {
            assignNext(techFreeAt, durationFor(q));
        }

        // The new arrival picks up the next-free tech.
        LocalDateTime earliestFree = Collections.min(techFreeAt.values());
        long minutes = Math.max(0, Duration.between(now, earliestFree).toMinutes());
        return (int) minutes;
    }

    /**
     * Recompute estimatedWaitTime for every WAITING queue entry in order,
     * using the same scheduler simulation. Returns the list in queue order.
     * The caller should persist updated values.
     */
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
            LocalDateTime pickupAt = peekEarliest(techFreeAt);
            long mins = Math.max(0, Duration.between(now, pickupAt).toMinutes());
            q.setEstimatedWaitTime((int) mins);
            q.setPosition(position++);
            assignNext(techFreeAt, durationFor(q));
        }
        return waiting;
    }

    /* ---------------- internal scheduling helpers ---------------- */

    /**
     * Build a map of tech-id → next-free moment, starting from `now` and
     * pushed forward by any IN_PROGRESS work or upcoming appointments
     * they're committed to.
     */
    private Map<Long, LocalDateTime> buildTechFreeAtMap(LocalDateTime now) {
        // Service-providing employees only. Front-desk does not take walk-in
        // customers; everyone else (TECHNICIAN/MANAGER/ADMIN who's marked
        // available) is fair game.
        List<Employee> techs = employeeRepository.findAll().stream()
                .filter(Employee::isAvailable)
                .filter(e -> e.getRole() != Role.FRONT_DESK)
                .toList();

        Map<Long, LocalDateTime> map = new HashMap<>();
        for (Employee t : techs) {
            map.put(t.getId(), now);
        }
        if (map.isEmpty()) return map;

        // Push tech free-times forward for IN_PROGRESS queue work.
        // Assumption: the entry started at updatedAt and will run for its
        // estimatedWaitTime (or default).
        List<Queue> inProgress = queueRepository.findByStatus(QueueStatus.IN_PROGRESS);
        for (Queue q : inProgress) {
            Long empId = q.getEmployeeId();
            if (empId == null || !map.containsKey(empId)) continue;
            LocalDateTime startedAt = q.getUpdatedAt() != null ? q.getUpdatedAt() : now;
            LocalDateTime done = startedAt.plusMinutes(durationFor(q));
            if (done.isAfter(map.get(empId))) {
                map.put(empId, done);
            }
        }

        // Push tech free-times forward for imminent appointments. For each
        // tech we look at appointments inside [now, now + window] and merge
        // them into the free-at: if an appointment starts before the tech's
        // current free-at + slack, treat the tech as busy through the end
        // of that appointment.
        LocalDateTime windowEnd = now.plusHours(APPOINTMENT_WINDOW_HOURS);
        for (Long empId : map.keySet()) {
            List<Appointment> appts = appointmentRepository
                    .findByEmployeeIdAndStartTimeBetween(empId, now, windowEnd);
            for (Appointment a : appts) {
                int duration = totalDurationOf(a);
                LocalDateTime apptEnd = a.getStartTime().plusMinutes(duration);
                LocalDateTime currentFree = map.get(empId);
                // If the appointment overlaps the current free-at OR starts
                // before we could realistically squeeze a 30min walk-in in,
                // push the free-at to the appointment's end.
                if (a.getStartTime().isBefore(currentFree.plusMinutes(DEFAULT_SERVICE_MINUTES))
                        && apptEnd.isAfter(currentFree)) {
                    map.put(empId, apptEnd);
                }
            }
        }
        return map;
    }

    private LocalDateTime peekEarliest(Map<Long, LocalDateTime> techFreeAt) {
        return Collections.min(techFreeAt.values());
    }

    private void assignNext(Map<Long, LocalDateTime> techFreeAt, int serviceMinutes) {
        Map.Entry<Long, LocalDateTime> earliest = techFreeAt.entrySet().stream()
                .min(Comparator.comparing(Map.Entry::getValue))
                .orElse(null);
        if (earliest == null) return;
        techFreeAt.put(earliest.getKey(), earliest.getValue().plusMinutes(serviceMinutes));
    }

    private int durationFor(Queue q) {
        // For now walk-in queue entries don't carry a service duration; use
        // the existing estimated wait (which the FRONT_DESK can override) or
        // fall back to the default.
        if (q.getEstimatedWaitTime() != null && q.getEstimatedWaitTime() > 0
                && q.getEstimatedWaitTime() < 240) {
            // Treat anything <4h as a duration hint (not a propagated total wait).
            // This is a heuristic during the transition; once we wire services
            // into queue entries we can use the real number.
            return DEFAULT_SERVICE_MINUTES;
        }
        return DEFAULT_SERVICE_MINUTES;
    }

    private int totalDurationOf(Appointment a) {
        if (a.getServices() == null || a.getServices().isEmpty()) {
            return DEFAULT_SERVICE_MINUTES * 2; // appointment default = 60min
        }
        int total = a.getServices().stream()
                .mapToInt(ServiceType::getEstimatedDurationMinutes)
                .sum();
        return total > 0 ? total : DEFAULT_SERVICE_MINUTES * 2;
    }
}
