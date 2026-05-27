package com.salonhub.api.appointment.controller;

import com.salonhub.api.appointment.dto.AppointmentResponseDTO;
import com.salonhub.api.appointment.dto.BookingRequestDTO;
import com.salonhub.api.appointment.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Public Booking Controller for online appointment booking.
 * 
 * This endpoint is designed for customer-facing booking flows where:
 * - Customer may not have an account yet
 * - Customer provides their info (name, email, phone) directly
 * - System creates customer record if needed
 * 
 * Security: Requires authentication but allows CUSTOMER role
 */
@RestController
@RequestMapping("/api/bookings")
@Validated
@Tag(name = "Bookings", description = "Public appointment booking API for customers")
public class BookingController {
    
    private final AppointmentService appointmentService;
    
    public BookingController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }
    
    @PostMapping
    @Operation(
        summary = "Create a new booking",
        description = "Creates a new appointment booking. If customer doesn't exist, creates a new customer record. " +
                      "Accepts customer name, email, phone instead of requiring customer ID."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Booking created successfully",
            content = @Content(schema = @Schema(implementation = AppointmentResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request - missing required fields or invalid data"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Service or staff not found"
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Time slot is already booked"
        )
    })
    public ResponseEntity<AppointmentResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request) {
        AppointmentResponseDTO response = appointmentService.publicBook(request);
        return ResponseEntity.ok(response);
    }
}
