package com.salonhub.api.employee;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salonhub.api.employee.dto.EmployeeRequestDTO;
import com.salonhub.api.employee.dto.EmployeeResponseDTO;
import com.salonhub.api.employee.model.Role;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.salonhub.api.testfixtures.ServerSetupExtension;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ServerSetupExtension
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class EmployeeIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long createdEmployeeId;

    private Long createTestEmployee(String name, String role, Boolean available) throws Exception {
        EmployeeRequestDTO newEmp = new EmployeeRequestDTO();
        newEmp.setName(name);
        newEmp.setRole(role);
        newEmp.setAvailable(available);

        String json = objectMapper.writeValueAsString(newEmp);

        System.out.println(json);
        MvcResult result = mockMvc.perform(post("/api/employees")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(newEmp)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())
            .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        EmployeeResponseDTO createdEmployee = objectMapper.readValue(responseContent, EmployeeResponseDTO.class);
        return createdEmployee.getId();
    }

    @Test
    @Order(1)
    void testCreateEmployee() throws Exception {
        createdEmployeeId = createTestEmployee("Alice Smith", Role.TECHNICIAN.toString(), true);
    }

    @Test
    @Order(2)
    void testListEmployees() throws Exception {
        mockMvc.perform(get("/api/employees")
                .contentType("application/json"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").exists())
            .andExpect(jsonPath("$[0].name").value("Alice Smith"));
    }

    @Test
    @Order(3)
    void testUpdateEmployee() throws Exception {
        EmployeeRequestDTO updatedEmp = new EmployeeRequestDTO();
        updatedEmp.setAvailable(false);
        updatedEmp.setRole(Role.MANAGER.name());
        updatedEmp.setName("Alice Johnson");

        mockMvc.perform(put("/api/employees/{id}", createdEmployeeId)
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(updatedEmp)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(createdEmployeeId))
            .andExpect(jsonPath("$.name").value("Alice Johnson"))
            .andExpect(jsonPath("$.role").value("MANAGER"))
            .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    @Order(4)
    void testPatchSetAvailability() throws Exception {
        mockMvc.perform(patch("/api/employees/{id}/availability", createdEmployeeId)
                .param("available", "true"))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/employees/{id}", createdEmployeeId)
                .contentType("application/json"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    @Order(5)
    void testDeleteEmployee() throws Exception {
        mockMvc.perform(delete("/api/employees/{id}", createdEmployeeId))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/employees/{id}", createdEmployeeId))
            .andExpect(status().isNotFound());
    }
}