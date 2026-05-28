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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the smart wait-time scheduler. Validates the four
 * follow-ups: real service durations, salon-hours clamping, preferred-tech
 * routing, and the turnover buffer between back-to-back walk-ins.
 *
 * Inputs are seeded via mock repositories so we control exactly what the
 * estimator sees (tech roster, queue contents, appointments, services).
 * `now` is passed explicitly so the test isn't flaky against the wall clock.
 */
@ExtendWith(MockitoExtension.class)
class WaitTimeEstimatorTest {

    @Mock QueueRepository queueRepository;
    @Mock EmployeeRepository employeeRepository;
    @Mock AppointmentRepository appointmentRepository;
    @Mock ServiceTypeRepository serviceTypeRepository;
    @Mock BusinessSettingsService businessSettings;

    @InjectMocks WaitTimeEstimator estimator;

    /** Tuesday morning, well inside business hours. */
    private static final LocalDateTime TUE_10AM = LocalDateTime.of(2026, 6, 2, 10, 0);

    @BeforeEach
    void setupSettings() {
        // Default settings: 9am-7pm every day, 5min turnover. Individual
        // tests can override via lenient stubs when they need different hours.
        lenient().when(businessSettings.getTurnoverMinutes()).thenReturn(5);
        lenient().when(businessSettings.getHoursFor(any()))
            .thenReturn(new BusinessSettingsService.DayHoursParsed(
                LocalTime.of(9, 0), LocalTime.of(19, 0)));
        lenient().when(appointmentRepository.findByEmployeeIdAndStartTimeBetween(anyLong(), any(), any()))
            .thenReturn(List.of());
        lenient().when(queueRepository.findByStatus(QueueStatus.IN_PROGRESS)).thenReturn(List.of());
    }

    @Test
    void noTechsOnShift_returnsFallback() {
        when(employeeRepository.findAll()).thenReturn(List.of(frontDesk(1L, false)));
        // Queue lookup is short-circuited when no techs available; stub
        // leniently in case the impl changes.
        lenient().when(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING))
            .thenReturn(List.of());

        assertThat(estimator.estimateForNewArrival(TUE_10AM, null, null))
            .isEqualTo(WaitTimeEstimator.NO_STAFF_FALLBACK_MINUTES);
    }

    @Test
    void emptyQueueDuringBusinessHours_walkInSeenImmediately() {
        when(employeeRepository.findAll()).thenReturn(List.of(tech(1L), tech(2L)));
        when(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).thenReturn(List.of());

        assertThat(estimator.estimateForNewArrival(TUE_10AM, null, null)).isEqualTo(0);
    }

    @Test
    void parallelTechs_drainQueueProportionally() {
        // 6 techs, 12 walk-ins ahead (default 30min each, 5min turnover
        // applied AFTER each service). Per-tech: 2 walk-ins occupy the tech
        // from now to now + (30+5) + (30+5) = 70 min. The 13th walk-in
        // picks up at min(free_at) = 70 min.
        when(employeeRepository.findAll()).thenReturn(List.of(
            tech(1L), tech(2L), tech(3L), tech(4L), tech(5L), tech(6L)
        ));
        List<Queue> waiting = new java.util.ArrayList<>();
        for (int i = 0; i < 12; i++) waiting.add(waiter(100L + i, null, null));
        when(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).thenReturn(waiting);

        int wait = estimator.estimateForNewArrival(TUE_10AM, null, null);
        assertThat(wait).isEqualTo(70);
    }

    @Test
    void preferredTech_isolatesCustomerToThatLane() {
        // 5 techs, 4 empty. Lisa (id=1) has 3 picky-for-Lisa walk-ins.
        // No-preference customer: 0 min (some other tech is free now).
        // Picky-for-Lisa customer: 3 × (30+5) = 105 min.
        when(employeeRepository.findAll()).thenReturn(List.of(
            tech(1L), tech(2L), tech(3L), tech(4L), tech(5L)
        ));
        List<Queue> waiting = List.of(
            waiter(101L, 1L, null), waiter(102L, 1L, null), waiter(103L, 1L, null)
        );
        when(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).thenReturn(waiting);

        assertThat(estimator.estimateForNewArrival(TUE_10AM, null, null)).isEqualTo(0);
        assertThat(estimator.estimateForNewArrival(TUE_10AM, null, 1L)).isEqualTo(105);
    }

    @Test
    void longerServiceMeansLongerWait() {
        // 2 techs, 4 walk-ins default (30min). Drain: 2 per tech =
        // (30+5)+(30+5) = 70 min. New customer with 60-min service picks
        // up at 70 min from now. The customer's own service duration
        // doesn't count toward their wait (only how long until they're
        // SEATED).
        when(employeeRepository.findAll()).thenReturn(List.of(tech(1L), tech(2L)));
        List<Queue> waiting = List.of(
            waiter(101L, null, null), waiter(102L, null, null),
            waiter(103L, null, null), waiter(104L, null, null)
        );
        when(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).thenReturn(waiting);
        when(serviceTypeRepository.findById(7L)).thenReturn(Optional.of(service(7L, "Signature Manicure", 60)));

        assertThat(estimator.estimateForNewArrival(TUE_10AM, 7L, null)).isEqualTo(70);
    }

    @Test
    void perCustomerServiceDuration_affectsExistingQueueDrain() {
        // 1 tech, 3 walk-ins each booked for 60-min Signature Manicure.
        // Drain: (60+5) * 3 = 195 min. New customer waits 195 min.
        when(employeeRepository.findAll()).thenReturn(List.of(tech(1L)));
        when(serviceTypeRepository.findById(7L)).thenReturn(Optional.of(service(7L, "Signature Manicure", 60)));
        List<Queue> waiting = List.of(
            waiter(101L, null, 7L), waiter(102L, null, 7L), waiter(103L, null, 7L)
        );
        when(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).thenReturn(waiting);

        assertThat(estimator.estimateForNewArrival(TUE_10AM, null, null))
            .isEqualTo((60 + 5) * 3); // = 195
    }

    @Test
    void turnoverBufferAppliedAfterEachAssignment() {
        // 1 tech, 2 walk-ins. Each consumes 30 min service + 5 min cleanup.
        // After 2 walk-ins the tech is free at 70 min. New customer picks
        // up there.
        when(employeeRepository.findAll()).thenReturn(List.of(tech(1L)));
        when(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).thenReturn(List.of(
            waiter(101L, null, null), waiter(102L, null, null)
        ));

        assertThat(estimator.estimateForNewArrival(TUE_10AM, null, null)).isEqualTo(70);
    }

    @Test
    void appointmentsBlockTheChosenTech() {
        // 1 tech with a 60-min appointment starting 15 min from now.
        // The 30-min default for our service can't squeeze in before
        // the appointment, so we wait until after it (15+60 = 75 min).
        when(employeeRepository.findAll()).thenReturn(List.of(tech(1L)));
        when(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).thenReturn(List.of());

        Appointment a = new Appointment();
        a.setId(99L);
        a.setStartTime(TUE_10AM.plusMinutes(15));
        a.setServices(List.of(service(7L, "Signature Manicure", 60)));
        when(appointmentRepository.findByEmployeeIdAndStartTimeBetween(
                org.mockito.ArgumentMatchers.eq(1L), any(), any()))
            .thenReturn(List.of(a));

        assertThat(estimator.estimateForNewArrival(TUE_10AM, null, null)).isEqualTo(75);
    }

    @Test
    void walkInBeforeOpening_rollsForwardToOpen() {
        // Now = 6am, before salon opens at 9. 3 hour roll-forward.
        LocalDateTime sixAm = LocalDateTime.of(2026, 6, 2, 6, 0);
        when(employeeRepository.findAll()).thenReturn(List.of(tech(1L)));
        when(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).thenReturn(List.of());

        assertThat(estimator.estimateForNewArrival(sixAm, null, null)).isEqualTo(180);
    }

    @Test
    void walkInAfterClosing_rollsToTomorrowMorning() {
        // Now = 6:50pm; we close at 7pm; a 30-min service can't finish in
        // 10 minutes so we roll to tomorrow's 9am open. That's 14h10min.
        LocalDateTime closingSoon = LocalDateTime.of(2026, 6, 2, 18, 50);
        when(employeeRepository.findAll()).thenReturn(List.of(tech(1L)));
        when(queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING)).thenReturn(List.of());

        int wait = estimator.estimateForNewArrival(closingSoon, null, null);
        assertThat(wait).isEqualTo(14 * 60 + 10);
    }

    /* ----- small helpers ----- */

    private static Employee tech(long id) {
        Employee e = new Employee();
        e.setId(id);
        e.setName("Tech " + id);
        e.setAvailable(true);
        e.setRole(Role.TECHNICIAN);
        return e;
    }

    private static Employee frontDesk(long id, boolean available) {
        Employee e = new Employee();
        e.setId(id);
        e.setName("Front Desk " + id);
        e.setAvailable(available);
        e.setRole(Role.FRONT_DESK);
        return e;
    }

    private static Queue waiter(long id, Long preferredTechId, Long serviceTypeId) {
        Queue q = new Queue();
        q.setId(id);
        q.setEmployeeId(preferredTechId);
        q.setServiceTypeId(serviceTypeId);
        q.setStatus(QueueStatus.WAITING);
        return q;
    }

    private static ServiceType service(long id, String name, int duration) {
        ServiceType s = new ServiceType();
        s.setId(id);
        s.setName(name);
        s.setEstimatedDurationMinutes(duration);
        s.setPrice(BigDecimal.valueOf(40));
        s.setActive(true);
        return s;
    }

}
