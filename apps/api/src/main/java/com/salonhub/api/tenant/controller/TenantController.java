package com.salonhub.api.tenant.controller;

import com.salonhub.api.tenant.dto.CreateTenantRequest;
import com.salonhub.api.tenant.dto.CreateTenantResponse;
import com.salonhub.api.tenant.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Public onboarding endpoints. Anyone can:
 *   - check slug availability (GET /api/tenants/check-slug?slug=foo)
 *   - create a tenant + first admin (POST /api/tenants)
 *
 * Production deployments should rate-limit these — easy to write a bot
 * that signs up a thousand tenants. Out of scope for this MVP.
 */
@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
@Slf4j
public class TenantController {

    private final TenantService tenantService;

    @GetMapping("/check-slug")
    public ResponseEntity<Map<String, Object>> checkSlug(@RequestParam("slug") String slug) {
        boolean available = tenantService.isSlugAvailable(slug);
        return ResponseEntity.ok(Map.of(
            "slug", slug == null ? "" : slug.trim().toLowerCase(),
            "available", available
        ));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateTenantRequest req) {
        try {
            CreateTenantResponse response = tenantService.createTenant(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "validation_failed",
                "message", e.getMessage()
            ));
        } catch (IllegalStateException e) {
            // Service-role key not configured — operator hasn't set up Supabase.
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "error", "onboarding_disabled",
                "message", e.getMessage()
            ));
        }
    }
}
