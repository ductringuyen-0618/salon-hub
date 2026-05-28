package com.salonhub.api.tenant;

/**
 * Constants for the Hibernate filter that auto-scopes every read by
 * tenant_id. The filter is defined per-entity via @FilterDef + @Filter
 * (using these names) and enabled on each Hibernate session by
 * {@link com.salonhub.api.tenant.TenantSessionConfigurer}.
 */
public final class TenantFilter {
    /** Name of the Hibernate filter (referenced from @FilterDef/@Filter). */
    public static final String NAME = "tenantFilter";
    /** Name of the :tenantId parameter inside the filter condition. */
    public static final String PARAM = "tenantId";
    private TenantFilter() {}
}
