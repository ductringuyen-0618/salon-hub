package com.salonhub.api.appointment.mapper;

import com.salonhub.api.appointment.dto.ServiceTypeRequestDTO;
import com.salonhub.api.appointment.dto.ServiceTypeResponseDTO;
import com.salonhub.api.appointment.model.ServiceType;
import org.springframework.stereotype.Component;

@Component
public class ServiceTypeMapper {
    
    /**
     * Convert ServiceType entity to response DTO
     */
    public ServiceTypeResponseDTO toResponse(ServiceType serviceType) {
        if (serviceType == null) {
            return null;
        }
        
        return ServiceTypeResponseDTO.builder()
                .id(serviceType.getId())
                .name(serviceType.getName())
                .estimatedDurationMinutes(serviceType.getEstimatedDurationMinutes())
                .price(serviceType.getPrice())
                .description(serviceType.getDescription())
                .category(serviceType.getCategory())
                .popular(serviceType.getPopular())
                .active(serviceType.getActive())
                .build();
    }
    
    /**
     * Convert request DTO to ServiceType entity (for creation)
     */
    public ServiceType toEntity(ServiceTypeRequestDTO requestDTO) {
        if (requestDTO == null) {
            return null;
        }
        
        ServiceType serviceType = new ServiceType();
        serviceType.setName(requestDTO.getName().trim());
        serviceType.setEstimatedDurationMinutes(requestDTO.getEstimatedDurationMinutes());
        serviceType.setPrice(requestDTO.getPrice());
        serviceType.setDescription(requestDTO.getDescription());
        serviceType.setCategory(requestDTO.getCategory());
        serviceType.setPopular(requestDTO.getPopular() != null ? requestDTO.getPopular() : false);
        serviceType.setActive(requestDTO.getActive() != null ? requestDTO.getActive() : true);
        return serviceType;
    }
    
    /**
     * Update existing ServiceType entity with request DTO data
     */
    public void updateEntity(ServiceType existingServiceType, ServiceTypeRequestDTO requestDTO) {
        if (existingServiceType == null || requestDTO == null) {
            return;
        }
        
        existingServiceType.setName(requestDTO.getName().trim());
        existingServiceType.setEstimatedDurationMinutes(requestDTO.getEstimatedDurationMinutes());
        existingServiceType.setPrice(requestDTO.getPrice());
        existingServiceType.setDescription(requestDTO.getDescription());
        existingServiceType.setCategory(requestDTO.getCategory());
        if (requestDTO.getPopular() != null) {
            existingServiceType.setPopular(requestDTO.getPopular());
        }
        if (requestDTO.getActive() != null) {
            existingServiceType.setActive(requestDTO.getActive());
        }
    }
}
