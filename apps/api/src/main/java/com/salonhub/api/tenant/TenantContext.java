package com.salonhub.api.tenant;

/**
 * Per-thread holder for the currently-resolved tenant.
 *
 * Set by TenantInterceptor at the start of every HTTP request, cleared
 * after. Read by the Hibernate filter + the entity-listener that stamps
 * tenant_id on insert.
 *
 * Background system tasks (e.g. TestDataInitializer) that don't have an
 * HTTP request still need a tenant — they call {@link #runAs(Long, Runnable)}
 * to scope themselves.
 */
public final class TenantContext {

    /** Slug for the default tenant — the one all pre-V10 data lives under. */
    public static final String DEFAULT_SLUG = "default";

    /** id of the default tenant. Matches the V10 seed insert. */
    public static final Long DEFAULT_ID = 1L;

    private static final ThreadLocal<Long> CURRENT = new ThreadLocal<>();

    private TenantContext() {}

    public static void set(Long tenantId) {
        CURRENT.set(tenantId);
    }

    public static void clear() {
        CURRENT.remove();
    }

    /** Returns the current tenant id, or null if unscoped (system task). */
    public static Long current() {
        return CURRENT.get();
    }

    /** Returns the current tenant id, falling back to default if unscoped. */
    public static Long currentOrDefault() {
        Long c = CURRENT.get();
        return c != null ? c : DEFAULT_ID;
    }

    /**
     * Run a Runnable in the scope of the given tenant, restoring whatever
     * was set before.
     */
    public static void runAs(Long tenantId, Runnable task) {
        Long previous = CURRENT.get();
        try {
            CURRENT.set(tenantId);
            task.run();
        } finally {
            if (previous == null) CURRENT.remove();
            else CURRENT.set(previous);
        }
    }
}
