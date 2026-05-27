package com.salonhub.api.appointment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for public booking requests.
 * Accepts customer information directly instead of requiring pre-existing customer ID.
 * This is used for online booking where customers may not have an account.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {
    
    // Customer information - used to find or create customer
    @NotBlank(message = "Customer name is required")
    private String customerName;
    
    private String customerEmail;
    
    private String customerPhone;
    
    // Service information - at least one service is required
    @NotNull(message = "At least one service must be selected")
    private Long serviceId;
    
    // Optional: list of service IDs for multiple services
    private List<Long> serviceIds;
    
    // Staff information - optional, null means any available staff
    private Long staffId;
    
    private String staffName;
    
    // Appointment timing
    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledTime;
    
    // Optional fields
    private Integer duration;
    
    private Double price;
    
    private String notes;
    
    private String status;
    
    /**
     * Helper method to get service IDs as a list.
     * If serviceIds is null, wraps single serviceId in a list.
     */
    public List<Long> getServiceIdList() {
        if (serviceIds != null && !serviceIds.isEmpty()) {
            return serviceIds;
        }
        return serviceId != null ? List.of(serviceId) : List.of();
    }
}
