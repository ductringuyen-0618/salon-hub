package com.salonhub.api.customer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salonhub.api.customer.dto.CustomerRequestDTO;
import com.salonhub.api.customer.dto.CustomerResponseDTO;
import com.salonhub.api.testfixtures.ServerSetupExtension;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ServerSetupExtension
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CustomerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long createdCustomerId;
    private static final String EMAIL = "john.doe@example.com";

    @Test
    @Order(1)
    @DisplayName("POST /api/customers  → create customer")
    void whenCreateCustomer_thenReturnsIdAndEmail() throws Exception {
        CustomerRequestDTO req = new CustomerRequestDTO();
        req.setEmail(EMAIL);
        req.setName("John Doe");
        req.setPhoneNumber("123-4567");
        req.setNote("Test user");

        MvcResult mvc = mockMvc.perform(post("/api/customers")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.email").value(EMAIL))
            .andReturn();

        CustomerResponseDTO resp = objectMapper.readValue(
            mvc.getResponse().getContentAsString(),
            CustomerResponseDTO.class
        );
        createdCustomerId = resp.getId();
        assertThat(createdCustomerId).isPositive();
    }

    @Test
    @Order(2)
    @DisplayName("GET /api/customers  → list all, should include created")
    void whenListCustomers_thenContainsCreated() throws Exception {
        mockMvc.perform(get("/api/customers")
                .accept(APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(createdCustomerId))
            .andExpect(jsonPath("$[0].email").value(EMAIL));
    }

    @Test
    @Order(3)
    @DisplayName("GET /api/customers/{id}  → fetch by ID")
    void whenGetById_thenReturnsCustomer() throws Exception {
        mockMvc.perform(get("/api/customers/{id}", createdCustomerId)
                .accept(APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(EMAIL))
            .andExpect(jsonPath("$.name").value("John Doe"));
    }

    @Test
    @Order(4)
    @DisplayName("GET /api/customers?email=...  → fetch by email")
    void whenGetByEmail_thenReturnsCustomer() throws Exception {
        mockMvc.perform(get("/api/customers")
                .param("email", EMAIL)
                .accept(APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(createdCustomerId))
            .andExpect(jsonPath("$.name").value("John Doe"));
    }

    @Test
    @Order(5)
    @DisplayName("PUT /api/customers/{id}  → update customer")
    void whenUpdateCustomer_thenReflectChanges() throws Exception {
        CustomerRequestDTO update = new CustomerRequestDTO();
        update.setEmail(EMAIL);
        update.setName("Jane Doe");
        update.setPhoneNumber("987-6543");
        update.setNote("Updated user");

        mockMvc.perform(put("/api/customers/{id}", createdCustomerId)
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(createdCustomerId))
            .andExpect(jsonPath("$.name").value("Jane Doe"))
            .andExpect(jsonPath("$.note").value("Updated user"));
    }

    @Test
    @Order(6)
    @DisplayName("DELETE /api/customers/{id}  → delete then 404 on fetch")
    void whenDeleteCustomer_thenNotFound() throws Exception {
        mockMvc.perform(delete("/api/customers/{id}", createdCustomerId))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/customers/{id}", createdCustomerId))
            .andExpect(status().isNotFound());
    }
}