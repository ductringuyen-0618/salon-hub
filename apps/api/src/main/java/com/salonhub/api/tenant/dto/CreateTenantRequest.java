package com.salonhub.api.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Payload for POST /api/tenants. Public — anyone can sign up a new
 * business. We rate-limit and reserve common slugs in the service layer.
 */
@Data
public class CreateTenantRequest {

    @NotBlank(message = "Business name is required")
    @Size(min = 2, max = 120)
    private String businessName;

    /**
     * URL-safe slug for the new tenant. Becomes the subdomain
     * (e.g. "lisa-salon" → lisa-salon.salon-hub.app).
     * Validated for shape; reserved-word check happens in the service.
     */
    @NotBlank(message = "Slug is required")
    @Pattern(regexp = "^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$",
             message = "Slug must be 3-30 chars, lowercase letters/digits/hyphens, not starting or ending with a hyphen")
    private String slug;

    @NotBlank @Email
    private String adminEmail;

    @NotBlank
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    private String adminPassword;

    /** Optional friendly name for the admin user's profile. */
    @Size(max = 120)
    private String adminName;
}
