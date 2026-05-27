package com.salonhub.api.appointment.controller;

import com.salonhub.api.appointment.dto.AppointmentRequestDTO;
import com.salonhub.api.appointment.dto.AppointmentResponseDTO;
import com.salonhub.api.appointment.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * Appointment Controller with role-based permissions:
 * - CREATE appointments: FRONT_DESK, MANAGER, ADMIN
 * - VIEW appointments: TECHNICIAN (own), FRONT_DESK, MANAGER, ADMIN
 * - UPDATE appointments: FRONT_DESK, MANAGER, ADMIN
 * - DELETE appointments: MANAGER, ADMIN
 */
@RestController
@RequestMapping("/api/appointments")
@Validated
public class AppointmentController {
    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public ResponseEntity<AppointmentResponseDTO> create(@Valid @RequestBody AppointmentRequestDTO dto) {
        return ResponseEntity.ok(service.book(dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'FRONT_DESK', 'MANAGER', 'ADMIN')")
    public ResponseEntity<AppointmentResponseDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<AppointmentResponseDTO>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(service.listByCustomer(customerId));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN') or (authentication.principal.id == #employeeId)")
    public ResponseEntity<List<AppointmentResponseDTO>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(service.listByEmployee(employeeId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public ResponseEntity<AppointmentResponseDTO> update(@PathVariable Long id,
                                                          @Valid @RequestBody AppointmentRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public ResponseEntity<AppointmentResponseDTO> updateStatus(@PathVariable Long id,
                                                                @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
