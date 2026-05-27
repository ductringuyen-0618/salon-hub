package com.salonhub.api.appointment.service.impl;

import com.salonhub.api.appointment.dto.AppointmentRequestDTO;
import com.salonhub.api.appointment.dto.AppointmentResponseDTO;
import com.salonhub.api.appointment.dto.ServiceTypeDTO;
import com.salonhub.api.appointment.model.Appointment;
import com.salonhub.api.appointment.model.BookingStatus;
import com.salonhub.api.appointment.model.ServiceType;
import com.salonhub.api.appointment.repository.AppointmentRepository;
import com.salonhub.api.appointment.repository.ServiceTypeRepository;
import com.salonhub.api.appointment.service.AppointmentServiceImpl;
import com.salonhub.api.appointment.mapper.AppointmentMapper;
import com.salonhub.api.customer.model.Customer;
import com.salonhub.api.customer.repository.CustomerRepository;
import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.employee.repository.EmployeeRepository;

import jakarta.persistence.EntityNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository repo;
    @Mock
    private ServiceTypeRepository serviceTypeRepo;
    @Mock
    private AppointmentMapper mapper;
    @Mock
    private CustomerRepository customerRepo;
    @Mock
    private EmployeeRepository employeeRepo;

    @InjectMocks
    private AppointmentServiceImpl service;

    private Customer customer;
    private Employee employee;
    private ServiceType serviceType;
    private AppointmentRequestDTO request;
    private Appointment appointmentEntity;
    private Appointment savedEntity;
    private AppointmentResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        customer = new Customer();
        customer.setId(1L);
        employee = new Employee();
        employee.setId(2L);
        serviceType = new ServiceType(3L, "Manicure", 30, new java.math.BigDecimal("35.00"));

        request = new AppointmentRequestDTO();
        request.setCustomerId(1L);
        request.setEmployeeId(2L);
        request.setServiceIds(List.of(3L));
        request.setStartTime(LocalDateTime.of(2025,5,4,10,0));

        appointmentEntity = new Appointment();
        appointmentEntity.setStartTime(request.getStartTime());

        savedEntity = new Appointment();
        savedEntity.setId(99L);
        savedEntity.setCustomer(customer);
        savedEntity.setEmployee(employee);
        savedEntity.setServices(List.of(serviceType));
        savedEntity.setStartTime(request.getStartTime());
        savedEntity.setStatus(BookingStatus.PENDING);

        responseDTO = new AppointmentResponseDTO();
        responseDTO.setId(99L);
        responseDTO.setCustomerId(1L);
        responseDTO.setEmployeeId(2L);
        responseDTO.setServices(List.of(new ServiceTypeDTO(3L, "Manicure", 30)));
        responseDTO.setTotalEstimatedDuration(30);
        responseDTO.setStartTime(request.getStartTime());
        responseDTO.setStatus(BookingStatus.PENDING);
    }

    @Test
    void book_success() {
        // stubbing
        when(mapper.toEntity(request)).thenReturn(appointmentEntity);
        when(customerRepo.findById(1L)).thenReturn(Optional.of(customer));
        when(employeeRepo.findById(2L)).thenReturn(Optional.of(employee));
        when(serviceTypeRepo.findAllById(request.getServiceIds())).thenReturn(List.of(serviceType));
        when(repo.findByEmployeeIdAndStartTimeBetween(eq(2L), any(), any())).thenReturn(List.of());
        when(repo.save(appointmentEntity)).thenReturn(savedEntity);
        when(mapper.toResponse(savedEntity)).thenReturn(responseDTO);

        AppointmentResponseDTO result = service.book(request);

        assertNotNull(result);
        assertEquals(99L, result.getId());
        assertEquals(30, result.getTotalEstimatedDuration());
        verify(repo).save(appointmentEntity);
    }

    @Test
    void getById_notFound_throws() {
        when(repo.findById(100L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.getById(100L));
    }

    @Test
    void listByCustomer_returnsList() {
        Appointment e1 = savedEntity;
        when(repo.findByCustomerId(1L)).thenReturn(List.of(e1));
        when(mapper.toResponse(e1)).thenReturn(responseDTO);

        List<AppointmentResponseDTO> list = service.listByCustomer(1L);
        assertEquals(1, list.size());
        assertEquals(99L, list.get(0).getId());
    }

    @Test
    void cancel_marksCancelled() {
        when(repo.findById(99L)).thenReturn(Optional.of(savedEntity));
        when(repo.save(savedEntity)).thenReturn(savedEntity);
        when(mapper.toResponse(savedEntity)).thenReturn(responseDTO);
        service.cancel(99L);
        assertEquals(BookingStatus.CANCELLED, savedEntity.getStatus());
    }

    @Test
    void book_conflictThrows() {
        when(mapper.toEntity(request)).thenReturn(appointmentEntity);
        when(customerRepo.findById(1L)).thenReturn(Optional.of(customer));
        when(employeeRepo.findById(2L)).thenReturn(Optional.of(employee));
        when(serviceTypeRepo.findAllById(request.getServiceIds())).thenReturn(List.of(serviceType));
        // simulate conflict
        when(repo.findByEmployeeIdAndStartTimeBetween(eq(2L), any(), any()))
            .thenReturn(List.of(new Appointment()));

        assertThrows(IllegalStateException.class, () -> service.book(request));
    }

    @Test
    void update_success() {
        when(repo.findById(99L)).thenReturn(Optional.of(savedEntity));
        when(employeeRepo.findById(2L)).thenReturn(Optional.of(employee));
        when(serviceTypeRepo.findAllById(request.getServiceIds())).thenReturn(List.of(serviceType));
        when(repo.save(any(Appointment.class))).thenReturn(savedEntity);
        when(mapper.toResponse(savedEntity)).thenReturn(responseDTO);
        // test update
        AppointmentResponseDTO result = service.update(99L, request);
        assertNotNull(result);
        assertEquals(99L, result.getId());
        verify(repo).save(any(Appointment.class));
    }
}
