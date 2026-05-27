package com.salonhub.api.appointment.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequestDTO {
    @NotNull
    private Long customerId;

    private Long employeeId;

    @NotEmpty
    private List<@NotNull Long> serviceIds;

    @NotNull
    private LocalDateTime startTime;
}
