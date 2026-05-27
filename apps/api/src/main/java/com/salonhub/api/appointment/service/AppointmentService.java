package com.salonhub.api.appointment.service;

import com.salonhub.api.appointment.dto.AppointmentRequestDTO;
import com.salonhub.api.appointment.dto.AppointmentResponseDTO;
import com.salonhub.api.appointment.dto.BookingRequestDTO;
import java.util.List;

public interface AppointmentService {
    AppointmentResponseDTO book(AppointmentRequestDTO request);
    
    /**
     * Public booking method that accepts customer info directly.
     * Creates or finds customer, then creates appointment.
     * @param request Booking request with customer info and appointment details
     * @return Appointment response DTO
     */
    AppointmentResponseDTO publicBook(BookingRequestDTO request);
    
    List<AppointmentResponseDTO> listByCustomer(Long customerId);
    List<AppointmentResponseDTO> listByEmployee(Long employeeId);
    AppointmentResponseDTO getById(Long id);
    AppointmentResponseDTO update(Long id, AppointmentRequestDTO request);
    AppointmentResponseDTO updateStatus(Long id, String status);
    void cancel(Long id);
    void complete(Long id);
}