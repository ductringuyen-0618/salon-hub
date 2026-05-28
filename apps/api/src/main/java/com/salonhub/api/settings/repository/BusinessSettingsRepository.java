package com.salonhub.api.settings.repository;

import com.salonhub.api.settings.model.BusinessSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessSettingsRepository extends JpaRepository<BusinessSettings, Long> {
    /** Find the settings row for a specific tenant. Tenant uniqueness on
     *  tenant_id ensures at most one match. */
    Optional<BusinessSettings> findByTenantId(Long tenantId);
}
