package com.salonhub.api.appointment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salonhub.api.appointment.dto.ServiceTypeRequestDTO;
import com.salonhub.api.appointment.dto.ServiceTypeResponseDTO;
import com.salonhub.api.testfixtures.ServerSetupExtension;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ServerSetupExtension
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ServiceTypeIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long createdServiceTypeId;

    @Test
    @Order(1)
    @WithMockUser(roles = {"ADMIN"})
    void createServiceType_shouldReturnOkAndId() throws Exception {
        ServiceTypeRequestDTO request = new ServiceTypeRequestDTO();
        request.setName("Integration Test Service");
        request.setEstimatedDurationMinutes(60);
        request.setPrice(new BigDecimal("50.00"));

        var result = mockMvc.perform(post("/api/service-types")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.name").value("Integration Test Service"))
            .andExpect(jsonPath("$.estimatedDurationMinutes").value(60))
            .andExpect(jsonPath("$.price").value(50.00))
            .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        ServiceTypeResponseDTO response = objectMapper.readValue(responseJson, ServiceTypeResponseDTO.class);
        createdServiceTypeId = response.getId();
    }

    @Test
    @Order(2)
    @WithMockUser(roles = {"ADMIN"})
    void getServiceType_shouldReturnServiceType() throws Exception {
        mockMvc.perform(get("/api/service-types/{id}", createdServiceTypeId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(createdServiceTypeId))
            .andExpect(jsonPath("$.name").value("Integration Test Service"))
            .andExpect(jsonPath("$.estimatedDurationMinutes").value(60))
            .andExpect(jsonPath("$.price").value(50.00));
    }

    @Test
    @Order(3)
    @WithMockUser(roles = {"ADMIN"})
    void getAllServiceTypes_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/service-types"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(4)) // 3 default + 1 created
            .andExpect(jsonPath("$[?(@.name == 'Integration Test Service')]").exists());
    }

    @Test
    @Order(4)
    @WithMockUser(roles = {"MANAGER"})
    void updateServiceType_shouldReturnUpdated() throws Exception {
        ServiceTypeRequestDTO updateRequest = new ServiceTypeRequestDTO();
        updateRequest.setName("Updated Integration Test Service");
        updateRequest.setEstimatedDurationMinutes(75);
        updateRequest.setPrice(new BigDecimal("65.00"));

        mockMvc.perform(put("/api/service-types/{id}", createdServiceTypeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(createdServiceTypeId))
            .andExpect(jsonPath("$.name").value("Updated Integration Test Service"))
            .andExpect(jsonPath("$.estimatedDurationMinutes").value(75))
            .andExpect(jsonPath("$.price").value(65.00));
    }

    @Test
    @Order(5)
    @WithMockUser(roles = {"ADMIN"})
    void deleteServiceType_shouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/service-types/{id}", createdServiceTypeId))
            .andExpect(status().isNoContent());
    }

    @Test
    @Order(6)
    @WithMockUser(roles = {"ADMIN"})
    void getDeletedServiceType_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/service-types/{id}", createdServiceTypeId))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createServiceType_withExistingName_shouldReturn400() throws Exception {
        ServiceTypeRequestDTO request = new ServiceTypeRequestDTO();
        request.setName(ServiceTypeDatabaseDefault.HAIRCUT_NAME); // Use existing name
        request.setEstimatedDurationMinutes(30);
        request.setPrice(new BigDecimal("25.00"));

        mockMvc.perform(post("/api/service-types")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Service type with name '" + ServiceTypeDatabaseDefault.HAIRCUT_NAME + "' already exists"));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createServiceType_withInvalidData_shouldReturn400() throws Exception {
        ServiceTypeRequestDTO request = new ServiceTypeRequestDTO();
        request.setName(""); // Invalid empty name
        request.setEstimatedDurationMinutes(-10); // Invalid negative duration
        request.setPrice(new BigDecimal("-5.00")); // Invalid negative price

        mockMvc.perform(post("/api/service-types")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getServiceType_withNonExistentId_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/service-types/999999"))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateServiceType_withNonExistentId_shouldReturn404() throws Exception {
        ServiceTypeRequestDTO request = new ServiceTypeRequestDTO();
        request.setName("Non-existent Service");
        request.setEstimatedDurationMinutes(30);
        request.setPrice(new BigDecimal("25.00"));

        mockMvc.perform(put("/api/service-types/999999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deleteServiceType_withNonExistentId_shouldReturn404() throws Exception {
        mockMvc.perform(delete("/api/service-types/999999"))
            .andExpect(status().isNotFound());
    }

    // Security tests
    @Test
    void serviceTypeEndpoints_withoutAuthentication_shouldReturn403() throws Exception {
        mockMvc.perform(get("/api/service-types"))
            .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/service-types")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = {"TECHNICIAN"})
    void serviceTypeEndpoints_withInsufficientRole_shouldReturn403() throws Exception {
        mockMvc.perform(get("/api/service-types"))
            .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/service-types")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = {"FRONT_DESK"})
    void serviceTypeEndpoints_withFrontDeskRole_shouldReturn403() throws Exception {
        mockMvc.perform(get("/api/service-types"))
            .andExpect(status().isForbidden());
    }
}
