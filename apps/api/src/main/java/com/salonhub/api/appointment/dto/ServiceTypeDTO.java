package com.salonhub.api.appointment.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTypeDTO {
    private Long id;
    private String name;
    private Integer estimatedDurationMinutes;
}