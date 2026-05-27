package com.salonhub.api.appointment.dto;

import com.salonhub.api.appointment.model.BookingStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDTO {
    private Long id;
    private Long customerId;
    private Long employeeId;
    private List<ServiceTypeDTO> services;
    private Integer totalEstimatedDuration;
    private LocalDateTime startTime;
    private LocalDateTime actualEndTime;
    private BookingStatus status;
}