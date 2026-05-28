package com.salonhub.api.auth.supabase;

import com.salonhub.api.auth.model.User;
import com.salonhub.api.auth.repository.UserRepository;
import com.salonhub.api.tenant.TenantContext;
import com.salonhub.api.tenant.TenantSessionConfigurer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Converts a verified Supabase {@link Jwt} into a Spring authentication token
 * backed by the local {@link User} row (which carries role assignment).
 *
 * The signature verification itself is done by Spring Security's
 * oauth2-resource-server using the JWKS URL configured in
 * {@link SupabaseProperties}. This converter only runs once that succeeds.
 *
 * On first sign-in for a Supabase identity:
 *   1. Try to find a local User by supabase_user_id
 *   2. Fall back to email match — stamp supabase_user_id, preserve existing role
 *   3. Otherwise create a new local User with role=CUSTOMER
 *
 * Activated when `supabase.jwks-url` is configured.
 */
@Component
@Slf4j
@ConditionalOnProperty(name = "supabase.jwks-url")
public class SupabaseJwtAuthenticationFilter
        implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;
    /** Optional: only present when Hibernate filter is wired up. */
    @Autowired(required = false)
    private TenantSessionConfigurer sessionConfigurer;

    public SupabaseJwtAuthenticationFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
        log.info("Supabase JWT authentication converter active");
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        UUID supabaseUserId;
        try {
            supabaseUserId = UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException e) {
            log.warn("Supabase JWT subject is not a UUID: {}", jwt.getSubject());
            return null;
        }

        // SECURITY: when the Supabase JWT carries an app_metadata.tenant_id
        // claim, treat it as authoritative — overriding whatever
        // TenantResolutionFilter set from the X-Tenant-Slug header. Without
        // this, a logged-in admin of tenant A could spoof the header and
        // see tenant B's data. The header is only trusted for ANONYMOUS
        // requests (no JWT).
        Long jwtTenantId = extractTenantId(jwt);
        if (jwtTenantId != null) {
            TenantContext.set(jwtTenantId);
            // Re-prime the Hibernate filter against the corrected tenant
            // so any query made downstream of this filter scopes correctly.
            if (sessionConfigurer != null) {
                sessionConfigurer.disable();
                sessionConfigurer.enable(jwtTenantId);
            }
        }

        String email = jwt.getClaimAsString("email");
        User user = findOrCreateUser(supabaseUserId, email, jwt);
        if (user == null) {
            return null;
        }

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user, jwt, user.getAuthorities());
        auth.setDetails(jwt);
        return auth;
    }

    /**
     * Pull {@code tenant_id} out of Supabase's {@code app_metadata} claim.
     * Returns null if the claim is absent or malformed — we don't fail the
     * request in that case; we just leave whatever TenantResolutionFilter
     * already set in TenantContext (typically the default tenant). This
     * keeps the legacy seeded users (who don't have tenant_id stamped in
     * their Supabase metadata) working under the default tenant.
     */
    private static Long extractTenantId(Jwt jwt) {
        Object appMetadata = jwt.getClaims().get("app_metadata");
        if (!(appMetadata instanceof Map<?, ?> m)) return null;
        Object raw = m.get("tenant_id");
        if (raw == null) return null;
        try {
            if (raw instanceof Number n) return n.longValue();
            return Long.parseLong(raw.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Transactional
    protected User findOrCreateUser(UUID supabaseUserId, String email, Jwt jwt) {
        Optional<User> byId = userRepository.findBySupabaseUserId(supabaseUserId);
        if (byId.isPresent()) return byId.get();

        if (email != null && !email.isBlank()) {
            Optional<User> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                User existing = byEmail.get();
                existing.setSupabaseUserId(supabaseUserId);
                User saved = userRepository.save(existing);
                log.info("Linked existing local user {} (role={}) to Supabase identity {}",
                        email, saved.getRole(), supabaseUserId);
                return saved;
            }
        }

        if (email == null || email.isBlank()) {
            log.warn("Refusing to provision local user — Supabase token has no email claim (sub={})",
                    supabaseUserId);
            return null;
        }

        String displayName = extractDisplayName(jwt, email);
        User user = User.builder()
                .email(email)
                .name(displayName)
                .role(User.Role.CUSTOMER)
                .supabaseUserId(supabaseUserId)
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();
        User saved = userRepository.save(user);
        log.info("Provisioned local CUSTOMER for new Supabase identity {} (id={}, sub={})",
                email, saved.getId(), supabaseUserId);
        return saved;
    }

    @SuppressWarnings("unchecked")
    private static String extractDisplayName(Jwt jwt, String fallback) {
        Object userMetadata = jwt.getClaims().get("user_metadata");
        if (userMetadata instanceof Map<?, ?> m) {
            Object full = ((Map<String, Object>) m).get("full_name");
            if (full instanceof String s && !s.isBlank()) return s;
            Object name = ((Map<String, Object>) m).get("name");
            if (name instanceof String s && !s.isBlank()) return s;
        }
        return fallback;
    }
}
