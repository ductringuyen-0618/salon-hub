package com.salonhub.api.appointment.service;

import com.salonhub.api.appointment.dto.ServiceTypeRequestDTO;
import com.salonhub.api.appointment.dto.ServiceTypeResponseDTO;
import com.salonhub.api.appointment.mapper.ServiceTypeMapper;
import com.salonhub.api.appointment.model.ServiceType;
import com.salonhub.api.appointment.repository.ServiceTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceTypeService {
    
    private final ServiceTypeRepository repository;
    private final ServiceTypeMapper mapper;
    
    /**
     * Get all service types
     */
    public List<ServiceTypeResponseDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get service type by ID
     */
    public Optional<ServiceTypeResponseDTO> findById(Long id) {
        return repository.findById(id)
                .map(mapper::toResponse);
    }
    
    /**
     * Get service type by name (case-insensitive)
     */
    public Optional<ServiceTypeResponseDTO> findByName(String name) {
        return repository.findByNameIgnoreCase(name)
                .map(mapper::toResponse);
    }
    
    /**
     * Create a new service type
     */
    @Transactional
    public ServiceTypeResponseDTO create(ServiceTypeRequestDTO requestDTO) {
        // Check if service type with this name already exists
        if (repository.existsByNameIgnoreCase(requestDTO.getName())) {
            throw new IllegalArgumentException("Service type with this name already exists");
        }
        
        ServiceType serviceType = mapper.toEntity(requestDTO);
        ServiceType savedServiceType = repository.save(serviceType);
        return mapper.toResponse(savedServiceType);
    }
    
    /**
     * Update an existing service type
     */
    @Transactional
    public ServiceTypeResponseDTO update(Long id, ServiceTypeRequestDTO requestDTO) {
        ServiceType existingServiceType = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service type not found with ID: " + id));
        
        // Check if another service type with this name exists (excluding current one)
        Optional<ServiceType> conflictingServiceType = repository.findByNameIgnoreCase(requestDTO.getName());
        if (conflictingServiceType.isPresent() && !conflictingServiceType.get().getId().equals(id)) {
            throw new IllegalArgumentException("Service type with this name already exists");
        }
        
        mapper.updateEntity(existingServiceType, requestDTO);
        ServiceType updatedServiceType = repository.save(existingServiceType);
        return mapper.toResponse(updatedServiceType);
    }
    
    /**
     * Delete a service type by ID
     */
    @Transactional
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Service type not found with ID: " + id);
        }
        
        repository.deleteById(id);
    }
    
    /**
     * Check if service type exists by ID
     */
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }
    
    /**
     * Check if service type exists by name (case-insensitive)
     */
    public boolean existsByName(String name) {
        return repository.existsByNameIgnoreCase(name);
    }
}
