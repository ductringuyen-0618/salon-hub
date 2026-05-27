package com.salonhub.api.queue.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salonhub.api.queue.dto.QueueEntryDTO;
import com.salonhub.api.queue.dto.QueueUpdateDTO;
import com.salonhub.api.queue.model.QueueStatus;
import com.salonhub.api.queue.service.QueueService;
import com.salonhub.api.testfixtures.QueueTestDataBuilder;
import com.salonhub.api.config.TestSecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = QueueController.class)
@Import(TestSecurityConfig.class)
class QueueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QueueService queueService;

    @Autowired
    private ObjectMapper objectMapper;

    private QueueEntryDTO queueEntryDTO;
    private QueueUpdateDTO queueUpdateDTO;

    @BeforeEach
    void setUp() {
        queueEntryDTO = QueueTestDataBuilder.aQueueEntry().buildEntryDTO();
        queueUpdateDTO = QueueTestDataBuilder.aQueueEntry().buildUpdateDTO();
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void getCurrentQueue_shouldReturnQueueList() throws Exception {
        // Given
        List<QueueEntryDTO> queueList = List.of(queueEntryDTO);
        given(queueService.getCurrentQueue()).willReturn(queueList);

        // When & Then
        mockMvc.perform(get("/api/queue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(queueEntryDTO.getId()))
                .andExpect(jsonPath("$[0].customerId").value(queueEntryDTO.getCustomerId()))
                .andExpect(jsonPath("$[0].status").value(queueEntryDTO.getStatus().name()));
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void getCurrentQueue_shouldReturnEmptyList_whenNoQueueEntries() throws Exception {
        // Given
        given(queueService.getCurrentQueue()).willReturn(List.of());

        // When & Then
        mockMvc.perform(get("/api/queue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void getQueueEntry_shouldReturnQueueEntry() throws Exception {
        // Given
        given(queueService.getQueueEntry(1L)).willReturn(queueEntryDTO);

        // When & Then
        mockMvc.perform(get("/api/queue/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(queueEntryDTO.getId()))
                .andExpect(jsonPath("$.customerId").value(queueEntryDTO.getCustomerId()))
                .andExpect(jsonPath("$.status").value(queueEntryDTO.getStatus().name()));
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void getQueueEntry_shouldReturnNotFound_whenQueueEntryNotExists() throws Exception {
        // Given
        given(queueService.getQueueEntry(1L)).willThrow(new IllegalArgumentException("Queue entry not found"));

        // When & Then
        mockMvc.perform(get("/api/queue/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "FRONT_DESK")
    void updateQueueEntry_shouldReturnUpdatedEntry() throws Exception {
        // Given
        given(queueService.updateQueueEntry(eq(1L), any(QueueUpdateDTO.class))).willReturn(queueEntryDTO);

        // When & Then
        mockMvc.perform(put("/api/queue/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(queueUpdateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(queueEntryDTO.getId()))
                .andExpect(jsonPath("$.customerId").value(queueEntryDTO.getCustomerId()));
    }

    @Test
    @WithMockUser(roles = "FRONT_DESK")
    void updateQueueEntry_shouldReturnNotFound_whenQueueEntryNotExists() throws Exception {
        // Given
        given(queueService.updateQueueEntry(eq(1L), any(QueueUpdateDTO.class)))
                .willThrow(new IllegalArgumentException("Queue entry not found"));

        // When & Then
        mockMvc.perform(put("/api/queue/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(queueUpdateDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "FRONT_DESK")
    void removeFromQueue_shouldReturnNoContent() throws Exception {
        // Given
        doNothing().when(queueService).removeFromQueue(1L);

        // When & Then
        mockMvc.perform(delete("/api/queue/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "FRONT_DESK")
    void updateQueueStatus_shouldReturnUpdatedEntry() throws Exception {
        // Given
        given(queueService.updateQueueStatus(1L, QueueStatus.IN_PROGRESS)).willReturn(queueEntryDTO);

        // When & Then
        mockMvc.perform(patch("/api/queue/1/status")
                        .param("status", "IN_PROGRESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(queueEntryDTO.getId()))
                .andExpect(jsonPath("$.customerId").value(queueEntryDTO.getCustomerId()));
    }

    @Test
    @WithMockUser(roles = "FRONT_DESK")
    void updateQueueStatus_shouldReturnBadRequest_whenInvalidStatus() throws Exception {
        // When & Then
        mockMvc.perform(patch("/api/queue/1/status")
                        .param("status", "INVALID_STATUS"))
                .andExpect(status().isBadRequest());
    }
}
