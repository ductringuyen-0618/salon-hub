package com.salonhub.api.auth.supabase;

import com.salonhub.api.auth.model.User;
import com.salonhub.api.auth.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Validates Supabase-issued JWTs and authenticates the request as the
 * corresponding local {@link User}.
 *
 * Activated only when `supabase.jwt-secret` is configured (env:
 * SUPABASE_JWT_SECRET). Until then, the legacy JwtAuthenticationFilter
 * continues to own authentication so dev / E2E flows keep working.
 *
 * On first sign-in for a given Supabase user we provision a local User row
 * with role=CUSTOMER. Roles can be promoted to FRONT_DESK / MANAGER /
 * TECHNICIAN / ADMIN via the admin UI (separate endpoint, not here).
 */
@Component
@Slf4j
@ConditionalOnProperty(name = "supabase.jwt-secret")
public class SupabaseJwtAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final SecretKey signingKey;
    private final String expectedIssuer;

    public SupabaseJwtAuthenticationFilter(
            UserRepository userRepository,
            SupabaseProperties props) {
        this.userRepository = userRepository;
        // Supabase signs HS256 tokens with the raw JWT secret bytes.
        this.signingKey = Keys.hmacShaKeyFor(props.jwtSecret().getBytes(StandardCharsets.UTF_8));
        this.expectedIssuer = props.issuer() != null
                ? props.issuer()
                : (props.url() != null ? props.url() + "/auth/v1" : null);
        log.info("SupabaseJwtAuthenticationFilter active (issuer={})", expectedIssuer);
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Defense in depth: verify the issuer claim. Supabase tokens
            // come from <project>/auth/v1 — if we accidentally got a token
            // from someone else's project, reject it.
            if (expectedIssuer != null
                    && claims.getIssuer() != null
                    && !claims.getIssuer().equals(expectedIssuer)) {
                log.warn("Rejecting JWT with unexpected issuer: {}", claims.getIssuer());
                filterChain.doFilter(request, response);
                return;
            }

            UUID supabaseUserId;
            try {
                supabaseUserId = UUID.fromString(claims.getSubject());
            } catch (IllegalArgumentException e) {
                log.warn("JWT subject is not a valid UUID: {}", claims.getSubject());
                filterChain.doFilter(request, response);
                return;
            }

            String email = (String) claims.get("email");
            User user = findOrCreateUser(supabaseUserId, email, claims);
            if (user == null) {
                filterChain.doFilter(request, response);
                return;
            }

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        } catch (Exception e) {
            // Bad token: don't authenticate. Don't throw — let Spring Security
            // reject the request downstream via the normal anon path.
            log.debug("Supabase JWT validation failed: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Look up the local User by Supabase UUID. Falls back to email lookup so
     * pre-existing accounts can be linked on first Supabase sign-in. Creates
     * a new CUSTOMER row on truly-new sign-ins.
     */
    @Transactional
    protected User findOrCreateUser(UUID supabaseUserId, String email, Claims claims) {
        Optional<User> byId = userRepository.findBySupabaseUserId(supabaseUserId);
        if (byId.isPresent()) return byId.get();

        if (email != null && !email.isBlank()) {
            Optional<User> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                User existing = byEmail.get();
                existing.setSupabaseUserId(supabaseUserId);
                return userRepository.save(existing);
            }
        }

        if (email == null || email.isBlank()) {
            log.warn("Refusing to provision local user — Supabase token has no email claim (sub={})", supabaseUserId);
            return null;
        }

        // First sign-in for this identity. Provision as CUSTOMER; admin can
        // promote later.
        String displayName = extractDisplayName(claims, email);
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
        log.info("Provisioned local user for new Supabase identity: {} (id={}, sub={})",
                email, saved.getId(), supabaseUserId);
        return saved;
    }

    @SuppressWarnings("unchecked")
    private static String extractDisplayName(Claims claims, String fallback) {
        Object userMetadata = claims.get("user_metadata");
        if (userMetadata instanceof Map<?, ?> m) {
            Object full = ((Map<String, Object>) m).get("full_name");
            if (full instanceof String s && !s.isBlank()) return s;
            Object name = ((Map<String, Object>) m).get("name");
            if (name instanceof String s && !s.isBlank()) return s;
        }
        return fallback;
    }
}
