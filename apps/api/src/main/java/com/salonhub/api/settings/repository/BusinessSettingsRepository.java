package com.salonhub.api.settings.repository;

import com.salonhub.api.settings.model.BusinessSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessSettingsRepository extends JpaRepository<BusinessSettings, Long> {
    /** There's only ever one row (id=1, enforced by CHECK constraint). */
    long SINGLETON_ID = 1L;
}
