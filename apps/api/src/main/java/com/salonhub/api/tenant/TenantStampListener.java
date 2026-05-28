package com.salonhub.api.tenant;

import jakarta.persistence.PrePersist;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Method;

/**
 * JPA entity listener attached to every multi-tenant entity. Stamps
 * tenant_id on insert from {@link TenantContext#current()} so the
 * application can't accidentally write a row that bleeds across tenants.
 *
 * If the entity already has a tenant_id set (e.g. seed scripts assigning
 * to default tenant explicitly), we leave it alone.
 *
 * We don't have a common base class for our entities, so we use
 * reflection to set the tenantId field. Trade-off: tiny per-insert cost
 * vs. having to refactor 8 entities into a hierarchy.
 */
@Slf4j
public class TenantStampListener {

    @PrePersist
    public void onCreate(Object entity) {
        if (entity == null) return;
        Long current = TenantContext.current();
        if (current == null) return; // System task — let it write what it sets.

        try {
            var field = findTenantIdField(entity.getClass());
            if (field == null) return;
            field.setAccessible(true);
            Object existing = field.get(entity);
            if (existing == null) {
                field.set(entity, current);
            }
        } catch (Exception e) {
            log.warn("Failed to stamp tenant_id on {}: {}", entity.getClass(), e.getMessage());
        }
    }

    /**
     * Walks up the class hierarchy looking for a `tenantId` field. We don't
     * want to fail loudly if it's missing (some entities legitimately don't
     * have one, like Tenant itself).
     */
    private static java.lang.reflect.Field findTenantIdField(Class<?> klass) {
        Class<?> c = klass;
        while (c != null && c != Object.class) {
            for (java.lang.reflect.Field f : c.getDeclaredFields()) {
                if ("tenantId".equals(f.getName())) return f;
            }
            c = c.getSuperclass();
        }
        return null;
    }
}
