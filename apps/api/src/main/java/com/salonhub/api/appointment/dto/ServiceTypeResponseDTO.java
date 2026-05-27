package com.salonhub.api.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTypeResponseDTO {
    
    private Long id;
    private String name;
    private Integer estimatedDurationMinutes;
    private BigDecimal price;
    private String description;
    private String category;
    private Boolean popular;
    private Boolean active;
}
