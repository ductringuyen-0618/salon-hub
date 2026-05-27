package com.salonhub.api.auth.supabase;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Supabase Auth integration configuration.
 *
 * Activate by setting `supabase.jwt-secret` (env: SUPABASE_JWT_SECRET).
 * The other fields are diagnostic / future-use.
 */
@ConfigurationProperties(prefix = "supabase")
public record SupabaseProperties(
        /** Project URL, e.g. https://xxxx.supabase.co. Diagnostic only — the
         *  backend doesn't call Supabase REST, it only verifies tokens. */
        String url,

        /** The project's JWT signing secret. Available in Supabase dashboard
         *  -> Project Settings -> API -> JWT Settings. HS256-shared with
         *  Supabase's auth server. When unset, the legacy JwtService remains
         *  the only authentication mechanism. */
        String jwtSecret,

        /** Issuer claim Supabase puts on tokens; defaults to <url>/auth/v1.
         *  Used as a defense-in-depth check on incoming tokens. */
        String issuer
) {}
