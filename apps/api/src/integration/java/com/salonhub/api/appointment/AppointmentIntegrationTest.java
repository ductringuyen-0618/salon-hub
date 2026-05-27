package com.salonhub.api.appointment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salonhub.api.appointment.dto.AppointmentRequestDTO;
import com.salonhub.api.appointment.dto.AppointmentResponseDTO;
import com.salonhub.api.appointment.model.BookingStatus;
import com.salonhub.api.testfixtures.ServerSetupExtension;
import com.salonhub.api.testfixtures.CustomerDatabaseDefault;
import com.salonhub.api.testfixtures.EmployeeDatabaseDefault;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AppointmentController. Assumes Flyway migrations
 * have seeded the service_types table (Manicure ID = 1).
 * Customers and Employees are seeded by ServerSetupExtension.
 */
@ServerSetupExtension
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AppointmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // First Flyway-seeded service type (Manicure)
    private static final Long EXISTING_SERVICE_TYPE_ID = 1L;
    // Seeded by ServerSetupExtension
    private static final Long EXISTING_CUSTOMER_ID = CustomerDatabaseDefault.JANE_ID;
    private static final Long EXISTING_EMPLOYEE_ID = EmployeeDatabaseDefault.ALICE_ID;

    private static Long appointmentId;

    @Test
    @Order(1)
    void createAppointment_shouldReturnOkAndId() throws Exception {
        AppointmentRequestDTO req = new AppointmentRequestDTO();
        req.setCustomerId(EXISTING_CUSTOMER_ID);
        req.setEmployeeId(EXISTING_EMPLOYEE_ID);
        req.setServiceIds(List.of(EXISTING_SERVICE_TYPE_ID));
        req.setStartTime(LocalDateTime.now().plusDays(1));

        var result = mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())
            .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        AppointmentResponseDTO resp = objectMapper.readValue(responseJson, AppointmentResponseDTO.class);
        appointmentId = resp.getId();
        assert resp.getCustomerId().equals(EXISTING_CUSTOMER_ID);
    }

    @Test
    @Order(2)
    void getAppointment_shouldReturnAppointment() throws Exception {
        mockMvc.perform(get("/api/appointments/{id}", appointmentId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(appointmentId));
    }

    @Test
    @Order(3)
    void listByCustomer_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/appointments/customer/{customerId}", EXISTING_CUSTOMER_ID))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].customerId").value(EXISTING_CUSTOMER_ID));
    }

    @Test
    @Order(4)
    void updateAppointment_shouldReturnUpdated() throws Exception {
        AppointmentRequestDTO updateReq = new AppointmentRequestDTO();
        updateReq.setCustomerId(EXISTING_CUSTOMER_ID);
        updateReq.setEmployeeId(EXISTING_EMPLOYEE_ID);
        updateReq.setServiceIds(List.of(EXISTING_SERVICE_TYPE_ID));
        updateReq.setStartTime(LocalDateTime.now().plusDays(2));

        mockMvc.perform(put("/api/appointments/{id}", appointmentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(appointmentId));
    }

    @Test
    @Order(5)
    void patchStatus_shouldReturnInProgress() throws Exception {
        mockMvc.perform(patch("/api/appointments/{id}/status", appointmentId)
                .param("status", BookingStatus.IN_PROGRESS.name()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @Order(6)
    void deleteAppointment_shouldMarkCancelled() throws Exception {
        mockMvc.perform(delete("/api/appointments/{id}", appointmentId))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/appointments/{id}", appointmentId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
