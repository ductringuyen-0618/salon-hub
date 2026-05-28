package com.salonhub.api.auth.supabase;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Supabase Auth integration configuration.
 *
 * Activated when `supabase.jwks-url` is set (env: SUPABASE_JWKS_URL).
 * Tokens are verified against Supabase's published JWKS (ES256 asymmetric)
 * via Spring Security's oauth2-resource-server.
 */
@ConfigurationProperties(prefix = "supabase")
public record SupabaseProperties(
        /** Project URL, e.g. https://xxxx.supabase.co. */
        String url,

        /** JWKS endpoint. Typically
         *  https://<project>.supabase.co/auth/v1/.well-known/jwks.json
         *  Setting this enables Supabase-based authentication. */
        String jwksUrl,

        /** Expected `iss` claim on incoming tokens. Defaults to
         *  <url>/auth/v1. Used as a defense-in-depth check. */
        String issuer,

        /** Service-role secret key. Required to call the admin API
         *  (creating users with email_confirm=true and setting
         *  app_metadata). Never expose to the frontend. */
        String secretKey
) {}
