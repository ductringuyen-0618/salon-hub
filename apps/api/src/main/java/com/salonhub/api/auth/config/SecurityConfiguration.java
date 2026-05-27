package com.salonhub.api.auth.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(req ->
                        req.requestMatchers(
                                        // Authentication endpoints (public)
                                        "/api/auth/register",
                                        "/api/auth/login",
                                        // Check-in endpoints (public for customers and guests)
                                        "/api/checkin",
                                        "/api/checkin/existing",
                                        "/api/checkin/guest",
                                        // Queue stats (public for check-in page to show wait times)
                                        "/api/queue/stats",
                                        // Employees list (public for technician selection at check-in)
                                        "/api/employees",
                                        // Service types (public for viewing)
                                        "/api/service-types",
                                        "/api/service-types/**",
                                        // Public booking endpoint (requires auth but any authenticated user can book)
                                        "/api/bookings",
                                        "/api/bookings/**",
                                        // WebSocket endpoints (authentication happens at STOMP level)
                                        "/ws/**",
                                        "/ws-raw/**",
                                        // Health check (public)
                                        "/actuator/health",
                                        // API documentation (consider restricting in production)
                                        "/v3/api-docs/**",
                                        "/swagger-ui/**",
                                        "/swagger-ui.html"
                                ).permitAll()
                                // Customer management - POST is public for guest check-in, others need auth
                                .requestMatchers(HttpMethod.POST, "/api/customers").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/customers/**").hasAnyRole("FRONT_DESK", "MANAGER", "ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/customers/**").hasAnyRole("MANAGER", "ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/customers/**").hasRole("ADMIN")
                                // Employee management - List is public for technician selection, specific endpoints need auth
                                .requestMatchers(HttpMethod.GET, "/api/employees").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/employees/**").hasAnyRole("TECHNICIAN", "FRONT_DESK", "MANAGER", "ADMIN")
                                .requestMatchers(HttpMethod.POST, "/api/employees").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/employees/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/employees/**").hasRole("ADMIN")
                                .requestMatchers("/api/employees/**").hasAnyRole("TECHNICIAN", "FRONT_DESK", "MANAGER", "ADMIN")
                                // Appointment management - FRONT_DESK and above (with method-level security for self-access)
                                .requestMatchers(HttpMethod.GET, "/api/appointments/customer/**").hasAnyRole("FRONT_DESK", "MANAGER", "ADMIN")
                                .requestMatchers(HttpMethod.POST, "/api/appointments").hasAnyRole("FRONT_DESK", "MANAGER", "ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/appointments/**").hasAnyRole("FRONT_DESK", "MANAGER", "ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/appointments/**").hasAnyRole("MANAGER", "ADMIN")
                                .requestMatchers("/api/appointments/**").hasAnyRole("TECHNICIAN", "FRONT_DESK", "MANAGER", "ADMIN")
                                // Queue management - stats is public (for check-in page), other GETs need auth
                                .requestMatchers(HttpMethod.GET, "/api/queue/stats").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/queue/**").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/api/queue/**").hasAnyRole("FRONT_DESK", "MANAGER", "ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/queue/**").hasAnyRole("FRONT_DESK", "MANAGER", "ADMIN")
                                .requestMatchers(HttpMethod.PATCH, "/api/queue/**").hasAnyRole("FRONT_DESK", "MANAGER", "ADMIN")
                                .requestMatchers(HttpMethod.POST, "/api/queue/**").hasAnyRole("FRONT_DESK", "MANAGER", "ADMIN")
                                // Check-in guest data viewing - FRONT_DESK and above
                                .requestMatchers("/api/checkin/guests/today").hasAnyRole("FRONT_DESK", "MANAGER", "ADMIN")
                                // All other endpoints require authentication
                                .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
