package com.salonhub.api.tenant.repository;

import com.salonhub.api.tenant.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Tenants are the ONE thing not tenant-scoped (since they ARE the scope).
 * This repo bypasses the multi-tenant filter — it's queried by the
 * TenantInterceptor before tenant context is established.
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findBySlug(String slug);
}
