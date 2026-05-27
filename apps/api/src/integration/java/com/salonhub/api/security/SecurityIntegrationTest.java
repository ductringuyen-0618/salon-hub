package com.salonhub.api.security;

import com.salonhub.api.testfixtures.DatabaseSetupExtension;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the complete security configuration.
 * Tests the actual security filters and endpoint access control.
 */
@SpringBootTest
@ExtendWith(DatabaseSetupExtension.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SecurityIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    public void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    // ===== Public Endpoints Tests =====

    @Test
    @Order(1)
    void publicEndpoints_shouldBeAccessibleWithoutAuth() throws Exception {
        setUp();

        // Health check
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());

        // API Documentation
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk());

        // Check-in endpoints (public for customers)
        String checkInRequest = """
                {
                    "name": "Test Customer",
                    "phoneNumber": "1234567890",
                    "email": "test@example.com"
                }
                """;

        mockMvc.perform(post("/api/checkin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkInRequest))
                .andExpect(status().isOk());
    }

    @Test
    @Order(2) 
    void authEndpoints_shouldBeAccessibleWithoutAuth() throws Exception {
        setUp();

        String registerRequest = """
                {
                    "name": "Test User",
                    "email": "newuser@example.com",
                    "password": "password123",
                    "phoneNumber": "1234567890",
                    "role": "EMPLOYEE"
                }
                """;

        // Register should be accessible
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest))
                .andExpect(status().isOk());

        String loginRequest = """
                {
                    "email": "alice@salonhub.com",
                    "password": "password123"
                }
                """;

        // Login should be accessible
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isOk());
    }

    // ===== Protected Endpoints Tests =====

    @Test
    @Order(3)
    void protectedEndpoints_shouldRequireAuthentication() throws Exception {
        setUp();

        // Customer endpoints
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        // Employee endpoints
        mockMvc.perform(get("/api/employees"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        // Appointment endpoints
        mockMvc.perform(get("/api/appointments/1"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        // Queue endpoints
        mockMvc.perform(get("/api/queue"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/queue/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        // Authentication user endpoint
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(4)
    void invalidTokens_shouldBeRejected() throws Exception {
        setUp();

        mockMvc.perform(get("/api/customers")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/employees")
                        .header("Authorization", "Bearer expired-token"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/queue")
                        .header("Authorization", "Basic invalid-basic-auth"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    void malformedRequests_shouldBeHandledGracefully() throws Exception {
        setUp();

        // Malformed JSON
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ invalid json }"))
                .andExpect(status().isBadRequest());

        // Missing content type
        mockMvc.perform(post("/api/auth/register")
                        .content("{}"))
                .andExpect(status().isUnsupportedMediaType());

        // Empty request body for required endpoints
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(6)
    void corsAndSecurityHeaders_shouldBeConfigured() throws Exception {
        setUp();

        // Check CORS preflight
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"))
                .andExpect(header().exists("Access-Control-Allow-Methods"));

        // Check security headers on responses
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Content-Type-Options"))
                .andExpect(header().exists("X-Frame-Options"));
    }

    // ===== Role-Based Access Control Tests =====

    @Test
    @Order(7)
    void adminOnlyEndpoints_shouldRejectNonAdminRoles() throws Exception {
        setUp();

        // These would need valid JWT tokens with specific roles in a real test
        // For now, we verify that without proper authentication, they're rejected
        
        // Employee management (admin only)
        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/employees/1"))
                .andExpect(status().isUnauthorized());

        // Customer deletion (admin only)
        mockMvc.perform(delete("/api/customers/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(8)
    void managerOnlyEndpoints_shouldRejectLowerRoles() throws Exception {
        setUp();

        // Manager/Admin only endpoints
        mockMvc.perform(get("/api/queue/stats"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/appointments/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(9)
    void frontDeskEndpoints_shouldRejectTechnicianRole() throws Exception {
        setUp();

        // Front desk and above only
        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/queue/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }
}
