package com.salonhub.api.appointment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salonhub.api.appointment.dto.AppointmentRequestDTO;
import com.salonhub.api.appointment.dto.AppointmentResponseDTO;
import com.salonhub.api.appointment.service.AppointmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AppointmentController.class)
@Import(com.salonhub.api.config.TestSecurityConfig.class)
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AppointmentService service;

    @Autowired
    private ObjectMapper objectMapper;

    private AppointmentRequestDTO validRequest;
    private AppointmentRequestDTO invalidRequest;

    @BeforeEach
    void setUp() {
        validRequest = new AppointmentRequestDTO();
        validRequest.setCustomerId(1L);
        validRequest.setEmployeeId(2L);
        validRequest.setServiceIds(List.of(3L));
        validRequest.setStartTime(LocalDateTime.now().plusDays(1));

        invalidRequest = new AppointmentRequestDTO();
        // missing required fields
    }

    @Test
    @WithMockUser(roles = "FRONT_DESK")
    void whenPostValidAppointment_thenReturns200() throws Exception {
        when(service.book(any(AppointmentRequestDTO.class)))
            .thenReturn(new AppointmentResponseDTO());

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
            .andExpect(status().isOk());

        verify(service).book(any(AppointmentRequestDTO.class));
    }

    @Test
    @WithMockUser(roles = "FRONT_DESK")
    void whenPostInvalidAppointment_thenReturns400() throws Exception {
        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest());

        verifyNoInteractions(service);
    }
}
