package com.salonhub.api.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Availability snapshot for an employee on a specific day.
 *
 * Consumed by the public booking page so the user can see which time slots
 * are already taken BEFORE committing to a booking. Returns the time-windows
 * an employee is busy (start + estimated end). The frontend uses these to
 * disable conflicting slots.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAvailabilityResponseDTO {

    /** Employee id this snapshot is for. */
    private Long employeeId;

    /** The day requested (yyyy-MM-dd, in server's local zone for now). */
    private String date;

    /** Busy intervals — appointments already scheduled for this employee. */
    private List<BusyWindow> busy;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusyWindow {
        /** Inclusive start. */
        private LocalDateTime startTime;
        /** Exclusive end — startTime + sum of service durations. */
        private LocalDateTime endTime;
        /** Appointment id, useful for staff dashboards (not required by booking). */
        private Long appointmentId;
    }
}
