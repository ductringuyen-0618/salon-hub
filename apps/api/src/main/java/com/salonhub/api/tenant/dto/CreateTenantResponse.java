package com.salonhub.api.tenant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Returned from POST /api/tenants on success. The frontend uses the slug
 * to construct the post-signup redirect URL.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTenantResponse {
    private Long tenantId;
    private String slug;
    private String businessName;
    private String adminEmail;
    /** True if the admin can sign in immediately (email pre-confirmed). */
    private boolean adminReady;
}
