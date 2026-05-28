package com.salonhub.api.auth.supabase;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.UUID;

/**
 * Thin wrapper over Supabase's Admin API. Used during tenant onboarding to
 * create the first admin user with their email pre-confirmed (so they don't
 * have to click a confirmation link before signing in) and with
 * {@code tenant_id} stamped into their {@code app_metadata}.
 *
 * Activated only when {@code supabase.secret-key} is set. Without it
 * onboarding returns 503 — the operator hasn't configured the platform yet.
 */
@Component
@ConditionalOnProperty(name = "supabase.secret-key")
@RequiredArgsConstructor
@Slf4j
public class SupabaseAdminClient {

    private final SupabaseProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private RestClient client;

    private RestClient client() {
        if (client == null) {
            client = RestClient.builder()
                .baseUrl(props.url() + "/auth/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + props.secretKey())
                .defaultHeader("apikey", props.secretKey())
                .build();
        }
        return client;
    }

    /**
     * Create a Supabase auth user with email pre-confirmed and
     * {@code app_metadata.tenant_id} stamped. Returns the new user's
     * Supabase id (UUID).
     *
     * Throws if the email already exists in Supabase — the caller (tenant
     * onboarding service) is expected to handle that gracefully and surface
     * a useful 4xx to the frontend.
     */
    public UUID createAdminUser(String email, String password, Long tenantId, String fullName) {
        Map<String, Object> appMetadata = Map.of(
            "tenant_id", tenantId,
            "role", "ADMIN"
        );
        Map<String, Object> userMetadata = Map.of(
            "full_name", fullName == null ? email : fullName
        );
        Map<String, Object> body = Map.of(
            "email", email,
            "password", password,
            "email_confirm", true,
            "app_metadata", appMetadata,
            "user_metadata", userMetadata
        );

        try {
            String json = client().post()
                .uri("/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);
            JsonNode node = mapper.readTree(json);
            String id = node.path("id").asText();
            if (id == null || id.isBlank()) {
                throw new IllegalStateException("Supabase admin createUser returned no id: " + json);
            }
            return UUID.fromString(id);
        } catch (HttpClientErrorException e) {
            // 422 with error_code=email_exists is the most common failure;
            // re-throw a clearer wrapper.
            log.warn("Supabase admin createUser failed: {} {}",
                e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode() == HttpStatus.UNPROCESSABLE_ENTITY
                && e.getResponseBodyAsString() != null
                && e.getResponseBodyAsString().contains("email_exists")) {
                throw new EmailAlreadyRegisteredException(email);
            }
            throw new RuntimeException("Supabase admin createUser failed: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Supabase admin createUser failed", e);
            throw new RuntimeException("Failed to create user in Supabase: " + e.getMessage(), e);
        }
    }

    public static class EmailAlreadyRegisteredException extends RuntimeException {
        public EmailAlreadyRegisteredException(String email) {
            super("Email already registered: " + email);
        }
    }
}
