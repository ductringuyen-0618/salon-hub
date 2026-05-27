package com.salonhub.api.customer.controller;

import com.salonhub.api.customer.dto.CustomerRequestDTO;
import com.salonhub.api.customer.dto.CustomerResponseDTO;
import com.salonhub.api.customer.mapper.CustomerMapper;
import com.salonhub.api.customer.model.Customer;
import com.salonhub.api.customer.service.CustomerService;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

/**
 * Customer Controller with role-based permissions:
 * - GET operations: FRONT_DESK, MANAGER, ADMIN
 * - CREATE operations: FRONT_DESK, MANAGER, ADMIN
 * - UPDATE operations: MANAGER, ADMIN (managers can edit customer data)
 * - DELETE operations: ADMIN only
 */
@RestController
@RequestMapping("/api/customers")
@Tag(
    name = "👥 Customer Management", 
    description = """
        Manage salon customers including both registered users and walk-in guests.
        
        **Authentication Required**: All endpoints require valid JWT token
        
        **Role Requirements**:
        - **View customers**: FRONT_DESK, MANAGER, ADMIN
        - **Create customers**: FRONT_DESK, MANAGER, ADMIN  
        - **Update customers**: MANAGER, ADMIN
        - **Delete customers**: ADMIN only
        """
)
public class CustomerController {

    private final CustomerService service;
    private final CustomerMapper mapper;

    public CustomerController(CustomerService service, CustomerMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    @Operation(
        summary = "📋 Get All Customers",
        description = """
            Retrieve a list of all customers in the system.
            
            **Required Role**: FRONT_DESK, MANAGER, or ADMIN
            
            **Returns**: List of customer information including contact details and guest status
            """,
        responses = {
            @ApiResponse(responseCode = "200", description = "✅ Successfully retrieved customers"),
            @ApiResponse(responseCode = "401", description = "🔒 Authentication required - Please login first"),
            @ApiResponse(responseCode = "403", description = "⛔ Insufficient permissions - Requires FRONT_DESK+ role")
        }
    )
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public List<CustomerResponseDTO> list() {
        return service.findAll()
                      .stream()
                      .map(mapper::toResponse)
                      .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public ResponseEntity<CustomerResponseDTO> getById(
        @PathVariable @Positive(message = "ID must be a positive number") Long id
    ) {
        return service.findById(id)
            .map(mapper::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(params = "email")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public ResponseEntity<CustomerResponseDTO> getByEmail(
        @RequestParam String email
    ) {
        return service.findByEmail(email)
            .map(mapper::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new customer
     * PUBLIC endpoint - used by check-in page for guest registration
     */
    @PostMapping
    public ResponseEntity<CustomerResponseDTO> create(
        @RequestBody @Valid CustomerRequestDTO dto
    ) {
        Customer customer = mapper.toEntity(dto);
        Customer created = service.create(customer);
        return ResponseEntity.ok(mapper.toResponse(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<CustomerResponseDTO> update(
        @PathVariable @Positive Long id,
        @RequestBody @Valid CustomerRequestDTO dto
    ) {
        return service.update(id, mapper.toEntity(dto))
            .map(mapper::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
        @PathVariable @Positive Long id
    ) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}