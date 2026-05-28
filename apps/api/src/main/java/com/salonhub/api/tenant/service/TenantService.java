package com.salonhub.api.tenant.service;

import com.salonhub.api.auth.model.User;
import com.salonhub.api.auth.repository.UserRepository;
import com.salonhub.api.auth.supabase.SupabaseAdminClient;
import com.salonhub.api.settings.model.BusinessSettings;
import com.salonhub.api.settings.repository.BusinessSettingsRepository;
import com.salonhub.api.tenant.TenantContext;
import com.salonhub.api.tenant.dto.CreateTenantRequest;
import com.salonhub.api.tenant.dto.CreateTenantResponse;
import com.salonhub.api.tenant.model.Tenant;
import com.salonhub.api.tenant.repository.TenantRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Tenant lifecycle:
 *   - findBySlug / getDefault       — used by the request filter
 *   - createTenant                  — public onboarding flow
 *   - isSlugAvailable               — live validation for the signup form
 *
 * Onboarding stamps everything the new business needs to function:
 *   1. Tenants row
 *   2. Supabase auth user with email pre-confirmed + app_metadata.tenant_id
 *   3. Local User row linked to the Supabase id with ADMIN role
 *   4. business_settings row with sensible defaults
 *
 * All of step 1-4 are wrapped in {@link TenantContext#runAs} so the
 * Hibernate entity listener stamps tenant_id on the User + BusinessSettings
 * rows automatically.
 */
@Service
@Slf4j
public class TenantService {

    private final TenantRepository repository;
    private final UserRepository userRepository;
    private final BusinessSettingsRepository settingsRepository;
    /** May be null if SUPABASE_SECRET_KEY isn't set — onboarding then 503s. */
    @Autowired(required = false)
    private SupabaseAdminClient supabaseAdmin;

    public TenantService(TenantRepository repository,
                         UserRepository userRepository,
                         BusinessSettingsRepository settingsRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
    }

    /** Slugs reserved for platform / infra use. */
    private static final Set<String> RESERVED_SLUGS = Set.of(
        "default", "admin", "api", "www", "app", "auth", "signup", "login",
        "register", "support", "help", "docs", "blog", "status", "ops",
        "internal", "staff", "salon-hub", "salonhub", "system"
    );

    public Optional<Tenant> findBySlug(String slug) {
        if (slug == null || slug.isBlank()) return Optional.empty();
        return repository.findBySlug(slug.trim());
    }

    public Tenant getDefault() {
        return repository.findById(TenantContext.DEFAULT_ID)
                .orElseThrow(() -> new IllegalStateException(
                    "Default tenant (id=1) missing — was the V10 migration applied?"));
    }

    /**
     * Returns true if the slug is well-formed AND not reserved AND not
     * already taken. The signup form polls this on input.
     */
    public boolean isSlugAvailable(String slug) {
        if (slug == null || slug.isBlank()) return false;
        String normalized = slug.trim().toLowerCase();
        if (!normalized.matches("^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$")) return false;
        if (RESERVED_SLUGS.contains(normalized)) return false;
        return repository.findBySlug(normalized).isEmpty();
    }

    @Transactional
    public CreateTenantResponse createTenant(CreateTenantRequest req) {
        if (supabaseAdmin == null) {
            throw new IllegalStateException(
                "Tenant onboarding is not available on this deployment — SUPABASE_SECRET_KEY is not set.");
        }
        String slug = req.getSlug().trim().toLowerCase();
        if (RESERVED_SLUGS.contains(slug)) {
            throw new IllegalArgumentException("Slug '" + slug + "' is reserved.");
        }
        if (repository.findBySlug(slug).isPresent()) {
            throw new IllegalArgumentException("Slug '" + slug + "' is already taken.");
        }

        // 1. Create the Tenant row.
        Tenant tenant = new Tenant(slug, req.getBusinessName().trim());
        Tenant savedTenant;
        try {
            savedTenant = repository.save(tenant);
        } catch (DataIntegrityViolationException race) {
            throw new IllegalArgumentException("Slug '" + slug + "' is already taken.");
        }

        // 2-4. Scope the remaining inserts to the new tenant so the
        // TenantStampListener tags the User + BusinessSettings rows.
        final Tenant tenantRef = savedTenant;
        TenantContext.runAs(tenantRef.getId(), () -> {
            // 2. Supabase auth user (email pre-confirmed; tenant_id in app_metadata).
            UUID supabaseId;
            try {
                supabaseId = supabaseAdmin.createAdminUser(
                    req.getAdminEmail().trim().toLowerCase(),
                    req.getAdminPassword(),
                    tenantRef.getId(),
                    req.getAdminName()
                );
            } catch (SupabaseAdminClient.EmailAlreadyRegisteredException e) {
                // Roll back the tenant; we can't proceed without an admin.
                throw new IllegalArgumentException(
                    "Email " + req.getAdminEmail() + " is already registered. "
                  + "Pick a different email or sign in instead.");
            }

            // 3. Local User row tied to the Supabase id, role=ADMIN.
            User admin = User.builder()
                .email(req.getAdminEmail().trim().toLowerCase())
                .name(req.getAdminName() == null || req.getAdminName().isBlank()
                      ? req.getAdminEmail() : req.getAdminName().trim())
                .role(User.Role.ADMIN)
                .supabaseUserId(supabaseId)
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();
            userRepository.save(admin);

            // 4. Default business settings for the new tenant.
            BusinessSettings settings = new BusinessSettings();
            settings.setBusinessName(req.getBusinessName().trim());
            settings.setBusinessHours(defaultHoursMap());
            settings.setTurnoverMinutes(5);
            settings.setThemePrimary("#d34000");
            settings.setThemeAccent("#7c3aed");
            settingsRepository.save(settings);

            log.info("Onboarded new tenant: slug={}, id={}, admin={}",
                tenantRef.getSlug(), tenantRef.getId(), req.getAdminEmail());
        });

        return new CreateTenantResponse(
            tenantRef.getId(), tenantRef.getSlug(), tenantRef.getName(),
            req.getAdminEmail().trim().toLowerCase(), true
        );
    }

    private static Map<String, Map<String, Object>> defaultHoursMap() {
        Map<String, Map<String, Object>> all = new LinkedHashMap<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("open",   day == DayOfWeek.SUNDAY ? "10:00" : "09:00");
            entry.put("close",  day == DayOfWeek.SUNDAY ? "17:00" : "19:00");
            entry.put("closed", Boolean.FALSE);
            all.put(day.name().toLowerCase(), entry);
        }
        return all;
    }
}
