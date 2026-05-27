package com.salonhub.api.checkin.controller;

import com.salonhub.api.checkin.dto.CheckInRequestDTO;
import com.salonhub.api.checkin.dto.CheckInResponseDTO;
import com.salonhub.api.customer.model.Customer;
import com.salonhub.api.checkin.service.CheckInService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Check-in Controller with role-based permissions:
 * - Basic check-in endpoints: Public (for customers)
 * - View guest data: FRONT_DESK, MANAGER, ADMIN
 */
@RestController
@RequestMapping("/api/checkin")
public class CheckInController {

    @Autowired
    private CheckInService checkInService;

    /**
     * Unified check-in endpoint that handles both guest and existing customer check-ins
     */
    @PostMapping
    public ResponseEntity<CheckInResponseDTO> checkIn(@RequestBody @Valid CheckInRequestDTO request) {
        // Let exceptions propagate to GlobalExceptionHandler for proper error messages
        CheckInResponseDTO response = checkInService.checkIn(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Legacy endpoint for existing customer check-in (backward compatibility)
     */
    @PostMapping("/existing")
    public ResponseEntity<Customer> checkInExisting(@RequestParam String phoneOrEmail) {
        // Let exceptions propagate to GlobalExceptionHandler for proper error messages
        Customer customer = checkInService.checkInExistingCustomer(phoneOrEmail);
        return ResponseEntity.ok(customer);
    }

    /**
     * Legacy endpoint for guest check-in (backward compatibility)
     */
    @PostMapping("/guest")
    public ResponseEntity<Customer> checkInGuest(@RequestParam String name, @RequestParam String phoneNumber) {
        // Let exceptions propagate to GlobalExceptionHandler for proper error messages
        Customer guest = checkInService.checkInGuest(name, phoneNumber);
        return ResponseEntity.ok(guest);
    }

    @GetMapping("/guests/today")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public List<Customer> getTodayCheckedInGuests() {
        return checkInService.getTodayCheckedInGuests();
    }
}