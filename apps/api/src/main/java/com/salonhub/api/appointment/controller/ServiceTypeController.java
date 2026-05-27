package com.salonhub.api.appointment.controller;

import com.salonhub.api.appointment.dto.ServiceTypeRequestDTO;
import com.salonhub.api.appointment.dto.ServiceTypeResponseDTO;
import com.salonhub.api.appointment.service.ServiceTypeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ServiceType Controller with role-based permissions:
 * - GET operations: MANAGER, ADMIN
 * - CREATE operations: MANAGER, ADMIN
 * - UPDATE operations: MANAGER, ADMIN  
 * - DELETE operations: MANAGER, ADMIN
 */
@RestController
@RequestMapping("/api/service-types")
@RequiredArgsConstructor
@Validated
public class ServiceTypeController {
    
    private final ServiceTypeService service;
    
    /**
     * Get all service types
     * PUBLIC endpoint - used by check-in page for service selection
     */
    @GetMapping
    public ResponseEntity<List<ServiceTypeResponseDTO>> getAllServiceTypes() {
        List<ServiceTypeResponseDTO> serviceTypes = service.findAll();
        return ResponseEntity.ok(serviceTypes);
    }
    
    /**
     * Get service type by ID
     * PUBLIC endpoint - used for viewing service details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ServiceTypeResponseDTO> getServiceTypeById(
            @PathVariable @Positive(message = "ID must be a positive number") Long id) {
        return service.findById(id)
                .map(serviceType -> ResponseEntity.ok(serviceType))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get service type by name
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ServiceTypeResponseDTO> getServiceTypeByName(
            @RequestParam String name) {
        return service.findByName(name)
                .map(serviceType -> ResponseEntity.ok(serviceType))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new service type
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ServiceTypeResponseDTO> createServiceType(
            @RequestBody @Valid ServiceTypeRequestDTO requestDTO) {
        try {
            ServiceTypeResponseDTO createdServiceType = service.create(requestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdServiceType);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update an existing service type
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ServiceTypeResponseDTO> updateServiceType(
            @PathVariable @Positive(message = "ID must be a positive number") Long id,
            @RequestBody @Valid ServiceTypeRequestDTO requestDTO) {
        try {
            ServiceTypeResponseDTO updatedServiceType = service.update(id, requestDTO);
            return ResponseEntity.ok(updatedServiceType);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete a service type
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Void> deleteServiceType(
            @PathVariable @Positive(message = "ID must be a positive number") Long id) {
        try {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Check if service type exists by ID
     */
    @GetMapping("/{id}/exists")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Boolean> existsById(
            @PathVariable @Positive(message = "ID must be a positive number") Long id) {
        boolean exists = service.existsById(id);
        return ResponseEntity.ok(exists);
    }
}
