package com.salonhub.api.settings.controller;

import com.salonhub.api.settings.dto.BusinessSettingsDTO;
import com.salonhub.api.settings.service.BusinessSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public read, admin write. Anonymous customers need GET to fetch the
 * business name and hours for the storefront; only ADMINs can mutate.
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class BusinessSettingsController {

    private final BusinessSettingsService service;

    @GetMapping
    public BusinessSettingsDTO get() {
        return service.getCurrentAsDto();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BusinessSettingsDTO> update(@RequestBody BusinessSettingsDTO dto) {
        service.update(dto);
        return ResponseEntity.ok(service.getCurrentAsDto());
    }
}
