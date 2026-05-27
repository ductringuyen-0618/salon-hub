package com.salonhub.api.auth.supabase;

import com.salonhub.api.auth.model.User;
import com.salonhub.api.auth.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
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
