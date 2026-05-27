package com.salonhub.api.employee.controller;

import com.salonhub.api.employee.dto.EmployeeRequestDTO;
import com.salonhub.api.employee.dto.EmployeeResponseDTO;
import com.salonhub.api.employee.mapper.EmployeeMapper;
import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.employee.service.EmployeeService;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Employee Controller with role-based permissions:
 * - LIST employees: MANAGER, ADMIN
 * - VIEW individual employee: MANAGER, ADMIN (or self for any role)
 * - CREATE employee: ADMIN only
 * - UPDATE employee: ADMIN only
 * - DELETE employee: ADMIN only
 * - UPDATE availability: Self or MANAGER, ADMIN
 */
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeService service;
    private final EmployeeMapper mapper;

    public EmployeeController(EmployeeService service, EmployeeMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    /**
     * List all employees
     * PUBLIC endpoint - used by check-in page for technician selection
     */
    @GetMapping
    public List<EmployeeResponseDTO> list() {
        return service.findAll()
                      .stream()
                      .map(mapper::toResponse)
                      .toList();
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Employee> getById(
        @PathVariable @Positive(message = "ID must be a positive number") Long id
    ) {
        return service.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponseDTO> create(@Valid @RequestBody EmployeeRequestDTO dto) {
        Employee e = mapper.toEntity(dto);
        Employee saved = service.create(e);
        return ResponseEntity.ok(mapper.toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponseDTO> update(
        @PathVariable @Positive Long id,
        @Valid @RequestBody EmployeeRequestDTO dto
    ) {
        return service.findById(id)
            .map(existing -> {
                mapper.updateEntity(dto, existing);
                Employee updated = service.create(existing);
                return ResponseEntity.ok(mapper.toResponse(updated));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> setAvailability(
            @PathVariable Long id,
            @RequestParam Boolean available) throws BadRequestException {
        service.setAvailability(id, available);
        return ResponseEntity.ok().build();
    }
}
