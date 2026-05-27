package com.salonhub.api.appointment.service;

import com.salonhub.api.appointment.ServiceTypeTestDataBuilder;
import com.salonhub.api.appointment.dto.ServiceTypeRequestDTO;
import com.salonhub.api.appointment.dto.ServiceTypeResponseDTO;
import com.salonhub.api.appointment.mapper.ServiceTypeMapper;
import com.salonhub.api.appointment.model.ServiceType;
import com.salonhub.api.appointment.repository.ServiceTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceTypeServiceTest {
    
    @Mock
    private ServiceTypeRepository repository;
    
    @Mock
    private ServiceTypeMapper mapper;
    
    @InjectMocks
    private ServiceTypeService service;
    
    private ServiceType haircutEntity;
    private ServiceType hairColorEntity;
    private ServiceTypeRequestDTO validRequest;
    private ServiceTypeResponseDTO haircutResponse;
    private ServiceTypeResponseDTO hairColorResponse;
    
    @BeforeEach
    void setUp() {
        haircutEntity = ServiceTypeTestDataBuilder.aHaircut().build();
        hairColorEntity = ServiceTypeTestDataBuilder.aHairColor().build();
        
        validRequest = ServiceTypeTestDataBuilder.aServiceType().buildRequestDTO();
        
        haircutResponse = ServiceTypeResponseDTO.builder()
                .id(1L)
                .name("Haircut")
                .estimatedDurationMinutes(30)
                .price(new BigDecimal("25.00"))
                .build();
                
        hairColorResponse = ServiceTypeResponseDTO.builder()
                .id(2L)
                .name("Hair Color")
                .estimatedDurationMinutes(120)
                .price(new BigDecimal("75.00"))
                .build();
    }
    
    @Test
    void findAll_shouldReturnAllServiceTypes() {
        // Arrange
        List<ServiceType> entities = Arrays.asList(haircutEntity, hairColorEntity);
        when(repository.findAll()).thenReturn(entities);
        when(mapper.toResponse(haircutEntity)).thenReturn(haircutResponse);
        when(mapper.toResponse(hairColorEntity)).thenReturn(hairColorResponse);
        
        // Act
        List<ServiceTypeResponseDTO> result = service.findAll();
        
        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Haircut", result.get(0).getName());
        assertEquals("Hair Color", result.get(1).getName());
        
        verify(repository).findAll();
        verify(mapper).toResponse(haircutEntity);
        verify(mapper).toResponse(hairColorEntity);
    }
    
    @Test
    void findById_whenExists_shouldReturnServiceType() {
        // Arrange
        when(repository.findById(1L)).thenReturn(Optional.of(haircutEntity));
        when(mapper.toResponse(haircutEntity)).thenReturn(haircutResponse);
        
        // Act
        Optional<ServiceTypeResponseDTO> result = service.findById(1L);
        
        // Assert
        assertTrue(result.isPresent());
        assertEquals("Haircut", result.get().getName());
        assertEquals(new BigDecimal("25.00"), result.get().getPrice());
        
        verify(repository).findById(1L);
        verify(mapper).toResponse(haircutEntity);
    }
    
    @Test
    void findById_whenNotExists_shouldReturnEmpty() {
        // Arrange
        when(repository.findById(999L)).thenReturn(Optional.empty());
        
        // Act
        Optional<ServiceTypeResponseDTO> result = service.findById(999L);
        
        // Assert
        assertFalse(result.isPresent());
        
        verify(repository).findById(999L);
        verify(mapper, never()).toResponse(any());
    }
    
    @Test
    void findByName_whenExists_shouldReturnServiceType() {
        // Arrange
        when(repository.findByNameIgnoreCase("Haircut")).thenReturn(Optional.of(haircutEntity));
        when(mapper.toResponse(haircutEntity)).thenReturn(haircutResponse);
        
        // Act
        Optional<ServiceTypeResponseDTO> result = service.findByName("Haircut");
        
        // Assert
        assertTrue(result.isPresent());
        assertEquals("Haircut", result.get().getName());
        
        verify(repository).findByNameIgnoreCase("Haircut");
        verify(mapper).toResponse(haircutEntity);
    }
    
    @Test
    void findByName_whenNotExists_shouldReturnEmpty() {
        // Arrange
        when(repository.findByNameIgnoreCase("NonExistent")).thenReturn(Optional.empty());
        
        // Act
        Optional<ServiceTypeResponseDTO> result = service.findByName("NonExistent");
        
        // Assert
        assertFalse(result.isPresent());
        
        verify(repository).findByNameIgnoreCase("NonExistent");
        verify(mapper, never()).toResponse(any());
    }
    
    @Test
    void create_withValidData_shouldReturnCreatedServiceType() {
        // Arrange
        ServiceType newEntity = ServiceTypeTestDataBuilder.aServiceType().withId(null).build();
        ServiceType savedEntity = ServiceTypeTestDataBuilder.aServiceType().withId(1L).build();
        ServiceTypeResponseDTO response = ServiceTypeResponseDTO.builder()
                .id(1L)
                .name("Test Service")
                .estimatedDurationMinutes(30)
                .price(new BigDecimal("25.00"))
                .build();
        
        when(repository.existsByNameIgnoreCase(validRequest.getName())).thenReturn(false);
        when(mapper.toEntity(validRequest)).thenReturn(newEntity);
        when(repository.save(newEntity)).thenReturn(savedEntity);
        when(mapper.toResponse(savedEntity)).thenReturn(response);
        
        // Act
        ServiceTypeResponseDTO result = service.create(validRequest);
        
        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Service", result.getName());
        assertEquals(new BigDecimal("25.00"), result.getPrice());
        
        verify(repository).existsByNameIgnoreCase(validRequest.getName());
        verify(mapper).toEntity(validRequest);
        verify(repository).save(newEntity);
        verify(mapper).toResponse(savedEntity);
    }
    
    @Test
    void create_withDuplicateName_shouldThrowException() {
        // Arrange
        when(repository.existsByNameIgnoreCase(validRequest.getName())).thenReturn(true);
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.create(validRequest)
        );
        
        assertEquals("Service type with this name already exists", exception.getMessage());
        
        verify(repository).existsByNameIgnoreCase(validRequest.getName());
        verify(mapper, never()).toEntity(any());
        verify(repository, never()).save(any());
    }
    
    @Test
    void update_withValidData_shouldReturnUpdatedServiceType() {
        // Arrange
        ServiceType existingEntity = ServiceTypeTestDataBuilder.aHaircut().build();
        ServiceType updatedEntity = ServiceTypeTestDataBuilder.aHaircut()
                .withName("Updated Haircut")
                .withPrice(new BigDecimal("30.00"))
                .build();
        ServiceTypeResponseDTO response = ServiceTypeResponseDTO.builder()
                .id(1L)
                .name("Updated Haircut")
                .estimatedDurationMinutes(30)
                .price(new BigDecimal("30.00"))
                .build();
        
        when(repository.findById(1L)).thenReturn(Optional.of(existingEntity));
        when(repository.findByNameIgnoreCase(validRequest.getName())).thenReturn(Optional.empty());
        when(repository.save(existingEntity)).thenReturn(updatedEntity);
        when(mapper.toResponse(updatedEntity)).thenReturn(response);
        
        // Act
        ServiceTypeResponseDTO result = service.update(1L, validRequest);
        
        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Updated Haircut", result.getName());
        assertEquals(new BigDecimal("30.00"), result.getPrice());
        
        verify(repository).findById(1L);
        verify(repository).findByNameIgnoreCase(validRequest.getName());
        verify(mapper).updateEntity(existingEntity, validRequest);
        verify(repository).save(existingEntity);
        verify(mapper).toResponse(updatedEntity);
    }
    
    @Test
    void update_whenNotExists_shouldThrowException() {
        // Arrange
        when(repository.findById(999L)).thenReturn(Optional.empty());
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.update(999L, validRequest)
        );
        
        assertEquals("Service type not found with ID: 999", exception.getMessage());
        
        verify(repository).findById(999L);
        verify(repository, never()).findByNameIgnoreCase(anyString());
        verify(mapper, never()).updateEntity(any(), any());
        verify(repository, never()).save(any());
    }
    
    @Test
    void update_withConflictingName_shouldThrowException() {
        // Arrange
        ServiceType existingEntity = ServiceTypeTestDataBuilder.aHaircut().build();
        ServiceType conflictingEntity = ServiceTypeTestDataBuilder.aHairColor().build();
        
        when(repository.findById(1L)).thenReturn(Optional.of(existingEntity));
        when(repository.findByNameIgnoreCase(validRequest.getName())).thenReturn(Optional.of(conflictingEntity));
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.update(1L, validRequest)
        );
        
        assertEquals("Service type with this name already exists", exception.getMessage());
        
        verify(repository).findById(1L);
        verify(repository).findByNameIgnoreCase(validRequest.getName());
        verify(mapper, never()).updateEntity(any(), any());
        verify(repository, never()).save(any());
    }
    
    @Test
    void update_withSameNameSameEntity_shouldSucceed() {
        // Arrange
        ServiceType existingEntity = ServiceTypeTestDataBuilder.aHaircut().build();
        ServiceType updatedEntity = ServiceTypeTestDataBuilder.aHaircut().build();
        ServiceTypeResponseDTO response = haircutResponse;
        
        when(repository.findById(1L)).thenReturn(Optional.of(existingEntity));
        when(repository.findByNameIgnoreCase(validRequest.getName())).thenReturn(Optional.of(existingEntity));
        when(repository.save(existingEntity)).thenReturn(updatedEntity);
        when(mapper.toResponse(updatedEntity)).thenReturn(response);
        
        // Act
        ServiceTypeResponseDTO result = service.update(1L, validRequest);
        
        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        
        verify(repository).findById(1L);
        verify(repository).findByNameIgnoreCase(validRequest.getName());
        verify(mapper).updateEntity(existingEntity, validRequest);
        verify(repository).save(existingEntity);
        verify(mapper).toResponse(updatedEntity);
    }
    
    @Test
    void deleteById_whenExists_shouldDeleteSuccessfully() {
        // Arrange
        when(repository.existsById(1L)).thenReturn(true);
        
        // Act
        service.deleteById(1L);
        
        // Assert
        verify(repository).existsById(1L);
        verify(repository).deleteById(1L);
    }
    
    @Test
    void deleteById_whenNotExists_shouldThrowException() {
        // Arrange
        when(repository.existsById(999L)).thenReturn(false);
        
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.deleteById(999L)
        );
        
        assertEquals("Service type not found with ID: 999", exception.getMessage());
        
        verify(repository).existsById(999L);
        verify(repository, never()).deleteById(any());
    }
    
    @Test
    void existsById_whenExists_shouldReturnTrue() {
        // Arrange
        when(repository.existsById(1L)).thenReturn(true);
        
        // Act
        boolean result = service.existsById(1L);
        
        // Assert
        assertTrue(result);
        verify(repository).existsById(1L);
    }
    
    @Test
    void existsById_whenNotExists_shouldReturnFalse() {
        // Arrange
        when(repository.existsById(999L)).thenReturn(false);
        
        // Act
        boolean result = service.existsById(999L);
        
        // Assert
        assertFalse(result);
        verify(repository).existsById(999L);
    }
    
    @Test
    void existsByName_whenExists_shouldReturnTrue() {
        // Arrange
        when(repository.existsByNameIgnoreCase("Haircut")).thenReturn(true);
        
        // Act
        boolean result = service.existsByName("Haircut");
        
        // Assert
        assertTrue(result);
        verify(repository).existsByNameIgnoreCase("Haircut");
    }
    
    @Test
    void existsByName_whenNotExists_shouldReturnFalse() {
        // Arrange
        when(repository.existsByNameIgnoreCase("NonExistent")).thenReturn(false);
        
        // Act
        boolean result = service.existsByName("NonExistent");
        
        // Assert
        assertFalse(result);
        verify(repository).existsByNameIgnoreCase("NonExistent");
    }
}
