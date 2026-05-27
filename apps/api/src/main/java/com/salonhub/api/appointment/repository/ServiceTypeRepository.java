package com.salonhub.api.appointment.repository;

import com.salonhub.api.appointment.model.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {
    
    /**
     * Find service type by name (case-insensitive)
     */
    Optional<ServiceType> findByNameIgnoreCase(String name);
    
    /**
     * Check if service type exists by name (case-insensitive)
     */
    boolean existsByNameIgnoreCase(String name);
}