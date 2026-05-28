package com.salonhub.api.tenant.service;

import com.salonhub.api.tenant.TenantContext;
import com.salonhub.api.tenant.model.Tenant;
import com.salonhub.api.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Tenant lookups and convenience helpers. NOT tenant-scoped itself — the
 * TenantInterceptor calls findBySlug() before any tenant context is set.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TenantService {

    private final TenantRepository repository;

    public Optional<Tenant> findBySlug(String slug) {
        if (slug == null || slug.isBlank()) return Optional.empty();
        return repository.findBySlug(slug.trim());
    }

    public Tenant getDefault() {
        return repository.findById(TenantContext.DEFAULT_ID)
                .orElseThrow(() -> new IllegalStateException(
                    "Default tenant (id=1) missing — was the V10 migration applied?"));
    }
}
