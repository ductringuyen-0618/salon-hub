package com.salonhub.api.checkin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CheckInRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Contact information is required")
    @Size(max = 100, message = "Contact must be less than 100 characters")
    private String contact; // This will be used for both phone and email based on format

    // Legacy fields for backward compatibility
    @Size(max = 20, message = "Phone number must be less than 20 characters")
    private String phoneNumber;

    private String email;

    private String note;

    // Flag to indicate if this is a guest check-in (true) or existing customer lookup (false)
    private boolean isGuest = false;

    // Additional fields that frontend might send
    private String requestedService;

    /** Optional ID of the chosen service. When set, the wait-time scheduler
     *  uses the service's real duration instead of the 30-min default. */
    private Long serviceTypeId;

    /** Optional ID of the customer's preferred technician. When set, the
     *  scheduler will assign this customer only to that tech (longer wait
     *  if the tech is busy, but accurate). */
    private Long preferredTechnicianId;
    
    // Helper method to get contact as phone or email
    public String getPhoneOrEmail() {
        if (contact != null && !contact.trim().isEmpty()) {
            return contact.trim();
        }
        return phoneNumber != null ? phoneNumber.trim() : email;
    }
    
    // Helper method to determine if contact looks like email
    public boolean isContactEmail() {
        if (contact == null) return false;
        return contact.contains("@");
    }
}
