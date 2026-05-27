package com.salonhub.api.appointment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salonhub.api.appointment.ServiceTypeTestDataBuilder;
import com.salonhub.api.appointment.dto.ServiceTypeRequestDTO;
import com.salonhub.api.appointment.dto.ServiceTypeResponseDTO;
import com.salonhub.api.appointment.service.ServiceTypeService;
import com.salonhub.api.config.TestSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ServiceTypeController.class)
@Import(TestSecurityConfig.class)
class ServiceTypeControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockitoBean
    private ServiceTypeService service;
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void getAllServiceTypes_shouldReturnList() throws Exception {
        // Arrange
        ServiceTypeResponseDTO haircut = ServiceTypeResponseDTO.builder()
                .id(1L)
                .name("Haircut")
                .estimatedDurationMinutes(30)
                .price(new BigDecimal("25.00"))
                .build();
        ServiceTypeResponseDTO hairColor = ServiceTypeResponseDTO.builder()
                .id(2L)
                .name("Hair Color")
                .estimatedDurationMinutes(120)
                .price(new BigDecimal("75.00"))
                .build();
        List<ServiceTypeResponseDTO> serviceTypes = Arrays.asList(haircut, hairColor);
        
        when(service.findAll()).thenReturn(serviceTypes);
        
        // Act & Assert
        mockMvc.perform(get("/api/service-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Haircut"))
                .andExpect(jsonPath("$[1].name").value("Hair Color"));
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void getServiceTypeById_whenExists_shouldReturnServiceType() throws Exception {
        // Arrange
        ServiceTypeResponseDTO serviceType = ServiceTypeResponseDTO.builder()
                .id(1L)
                .name("Haircut")
                .estimatedDurationMinutes(30)
                .price(new BigDecimal("25.00"))
                .build();
        when(service.findById(1L)).thenReturn(Optional.of(serviceType));
        
        // Act & Assert
        mockMvc.perform(get("/api/service-types/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Haircut"))
                .andExpect(jsonPath("$.price").value(25.00));
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void getServiceTypeById_whenNotExists_shouldReturn404() throws Exception {
        // Arrange
        when(service.findById(999L)).thenReturn(Optional.empty());
        
        // Act & Assert
        mockMvc.perform(get("/api/service-types/999"))
                .andExpect(status().isNotFound());
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void getServiceTypeByName_whenExists_shouldReturnServiceType() throws Exception {
        // Arrange
        ServiceTypeResponseDTO serviceType = ServiceTypeResponseDTO.builder()
                .id(1L)
                .name("Haircut")
                .estimatedDurationMinutes(30)
                .price(new BigDecimal("25.00"))
                .build();
        when(service.findByName("Haircut")).thenReturn(Optional.of(serviceType));
        
        // Act & Assert
        mockMvc.perform(get("/api/service-types/search?name=Haircut"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Haircut"));
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void createServiceType_withValidData_shouldReturnCreated() throws Exception {
        // Arrange
        ServiceTypeRequestDTO request = ServiceTypeTestDataBuilder.aServiceType().buildRequestDTO();
        ServiceTypeResponseDTO response = ServiceTypeResponseDTO.builder()
                .id(1L)
                .name("Test Service")
                .estimatedDurationMinutes(30)
                .price(new BigDecimal("25.00"))
                .build();
        when(service.create(any(ServiceTypeRequestDTO.class))).thenReturn(response);
        
        // Act & Assert
        mockMvc.perform(post("/api/service-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Service"));
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void createServiceType_withInvalidData_shouldReturn400() throws Exception {
        // Arrange
        ServiceTypeRequestDTO request = ServiceTypeRequestDTO.builder()
                .name("") // Invalid: empty name
                .estimatedDurationMinutes(-10) // Invalid: negative duration
                .price(new BigDecimal("-5.00")) // Invalid: negative price
                .build();
        
        // Act & Assert
        mockMvc.perform(post("/api/service-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void createServiceType_withDuplicateName_shouldReturn400() throws Exception {
        // Arrange
        ServiceTypeRequestDTO request = ServiceTypeTestDataBuilder.aServiceType().buildRequestDTO();
        when(service.create(any(ServiceTypeRequestDTO.class)))
                .thenThrow(new IllegalArgumentException("Service type with this name already exists"));
        
        // Act & Assert
        mockMvc.perform(post("/api/service-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void updateServiceType_withValidData_shouldReturnUpdated() throws Exception {
        // Arrange
        ServiceTypeRequestDTO request = ServiceTypeTestDataBuilder.aServiceType().buildRequestDTO();
        ServiceTypeResponseDTO response = ServiceTypeResponseDTO.builder()
                .id(1L)
                .name("Test Service")
                .estimatedDurationMinutes(30)
                .price(new BigDecimal("25.00"))
                .build();
        when(service.update(eq(1L), any(ServiceTypeRequestDTO.class))).thenReturn(response);
        
        // Act & Assert
        mockMvc.perform(put("/api/service-types/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Service"));
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void updateServiceType_whenNotExists_shouldReturn404() throws Exception {
        // Arrange
        ServiceTypeRequestDTO request = ServiceTypeTestDataBuilder.aServiceType().buildRequestDTO();
        when(service.update(eq(999L), any(ServiceTypeRequestDTO.class)))
                .thenThrow(new IllegalArgumentException("Service type not found"));
        
        // Act & Assert
        mockMvc.perform(put("/api/service-types/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void deleteServiceType_whenExists_shouldReturn204() throws Exception {
        // Arrange
        doNothing().when(service).deleteById(1L);
        
        // Act & Assert
        mockMvc.perform(delete("/api/service-types/1"))
                .andExpect(status().isNoContent());
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void deleteServiceType_whenNotExists_shouldReturn404() throws Exception {
        // Arrange
        doThrow(new IllegalArgumentException("Service type not found")).when(service).deleteById(999L);
        
        // Act & Assert
        mockMvc.perform(delete("/api/service-types/999"))
                .andExpect(status().isNotFound());
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void existsById_whenExists_shouldReturnTrue() throws Exception {
        // Arrange
        when(service.existsById(1L)).thenReturn(true);
        
        // Act & Assert
        mockMvc.perform(get("/api/service-types/1/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(true));
    }
    
    @Test
    @WithMockUser(roles = "MANAGER")
    void existsById_whenNotExists_shouldReturnFalse() throws Exception {
        // Arrange
        when(service.existsById(999L)).thenReturn(false);
        
        // Act & Assert
        mockMvc.perform(get("/api/service-types/999/exists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(false));
    }
}
