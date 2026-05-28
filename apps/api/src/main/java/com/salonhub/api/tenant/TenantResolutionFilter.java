package com.salonhub.api.tenant;

import com.salonhub.api.tenant.model.Tenant;
import com.salonhub.api.tenant.service.TenantService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Resolves the current tenant for every request as a Servlet Filter, so
 * it runs BEFORE Spring Security's filter chain. This matters because
 * JWT validation queries the users table; that query is now
 * tenant-scoped, so the tenant must already be in {@link TenantContext}
 * before security runs.
 *
 * Resolution order (first match wins):
 *   1. {@code X-Tenant-Slug} HTTP header (preferred — frontend explicitly
 *      sends this from its subdomain or VITE_TENANT_SLUG env var)
 *   2. First label of the Host header for subdomain routing
 *      ("lisa.salon-hub.app" -> "lisa", "www." and "api." excluded)
 *   3. Fall back to the seeded "default" tenant
 *
 * Unknown slugs fall back to default rather than 404'ing so the
 * storefront stays responsive to typo'd subdomains.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
@Slf4j
public class TenantResolutionFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Tenant-Slug";

    private final TenantService tenantService;
    private final TenantSessionConfigurer sessionConfigurer;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        // Skip ops endpoints — they don't need tenant scoping and shouldn't
        // trigger a DB lookup just to serve /actuator/health.
        String path = request.getRequestURI();
        if (path != null && (path.startsWith("/actuator/")
                || path.startsWith("/h2-console")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs"))) {
            chain.doFilter(request, response);
            return;
        }

        String slug = resolveSlug(request);
        Tenant tenant = tenantService.findBySlug(slug)
                .filter(Tenant::isActive)
                .orElseGet(tenantService::getDefault);
        TenantContext.set(tenant.getId());
        sessionConfigurer.enable(tenant.getId());
        try {
            chain.doFilter(request, response);
        } finally {
            sessionConfigurer.disable();
            TenantContext.clear();
        }
    }

    private String resolveSlug(HttpServletRequest request) {
        String header = request.getHeader(HEADER);
        if (header != null && !header.isBlank()) return header.trim();

        String host = request.getHeader("Host");
        if (host != null) {
            String hostname = host.contains(":") ? host.substring(0, host.indexOf(':')) : host;
            String[] parts = hostname.split("\\.");
            if (parts.length >= 3
                    && !parts[0].equalsIgnoreCase("www")
                    && !parts[0].equalsIgnoreCase("api")) {
                return parts[0];
            }
        }
        return TenantContext.DEFAULT_SLUG;
    }
}
