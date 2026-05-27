package com.salonhub.api.appointment.service;

import com.salonhub.api.appointment.dto.AppointmentRequestDTO;
import com.salonhub.api.appointment.dto.AppointmentResponseDTO;
import com.salonhub.api.appointment.dto.BookingRequestDTO;
import com.salonhub.api.appointment.mapper.AppointmentMapper;
import com.salonhub.api.appointment.model.Appointment;
import com.salonhub.api.appointment.model.BookingStatus;
import com.salonhub.api.appointment.model.ServiceType;
import com.salonhub.api.appointment.repository.AppointmentRepository;
import com.salonhub.api.appointment.repository.ServiceTypeRepository;

import com.salonhub.api.customer.model.Customer;
import com.salonhub.api.customer.repository.CustomerRepository;
import com.salonhub.api.employee.repository.EmployeeRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository repo;
    private final ServiceTypeRepository serviceTypeRepo;
    private final AppointmentMapper mapper;
    private final CustomerRepository customerRepo;
    private final EmployeeRepository employeeRepo;

    public AppointmentServiceImpl(
            AppointmentRepository repo,
            ServiceTypeRepository serviceTypeRepo,
            AppointmentMapper mapper,
            CustomerRepository customerRepo,
            EmployeeRepository employeeRepo) {
        this.repo = repo;
        this.serviceTypeRepo = serviceTypeRepo;
        this.mapper = mapper;
        this.customerRepo = customerRepo;
        this.employeeRepo = employeeRepo;
    }

    @Override
    public AppointmentResponseDTO book(AppointmentRequestDTO req) {
        // Convert DTO → Entity
        Appointment appt = mapper.toEntity(req);
        // Set relations
        appt.setCustomer(customerRepo.findById(req.getCustomerId())
            .orElseThrow(() -> new EntityNotFoundException("Customer not found")));
        appt.setEmployee(req.getEmployeeId() == null ? null :
            employeeRepo.findById(req.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found")));
        List<ServiceType> services = serviceTypeRepo.findAllById(req.getServiceIds());
        if (services.size() != req.getServiceIds().size()) {
            throw new EntityNotFoundException("One or more services not found");
        }
        appt.setServices(services);
        appt.setStartTime(req.getStartTime());
        appt.setStatus(BookingStatus.PENDING);

        // Conflict check
        int totalEstimate = services.stream()
            .mapToInt(ServiceType::getEstimatedDurationMinutes)
            .sum();
        if (appt.getEmployee() != null) {
            List<Appointment> conflicts = repo.findByEmployeeIdAndStartTimeBetween(
                appt.getEmployee().getId(), appt.getStartTime(), appt.getStartTime().plusMinutes(totalEstimate)
            );
            if (!conflicts.isEmpty()) {
                throw new IllegalStateException("Time slot is already booked");
            }
        }

        // Save and map to response
        Appointment saved = repo.save(appt);
        AppointmentResponseDTO response = mapper.toResponse(saved);
        response.setTotalEstimatedDuration(totalEstimate);
        return response;
    }

    @Override
    public List<AppointmentResponseDTO> listByCustomer(Long customerId) {
        return repo.findByCustomerId(customerId).stream()
            .map(this::enrich)
            .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponseDTO> listByEmployee(Long employeeId) {
        return repo.findByEmployeeIdAndStartTimeBetween(
            employeeId, LocalDateTime.MIN, LocalDateTime.MAX
        ).stream()
         .map(this::enrich)
         .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponseDTO getById(Long id) {
        Appointment appt = repo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        return enrich(appt);
    }

    @Override
    public AppointmentResponseDTO update(Long id, AppointmentRequestDTO req) {
        Appointment appt = repo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        // Update fields
        mapper.updateEntity(req, appt);
        if (req.getEmployeeId() != null) {
            appt.setEmployee(employeeRepo.findById(req.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found")));
        }
        if (req.getServiceIds() != null && !req.getServiceIds().isEmpty()) {
            List<ServiceType> services = serviceTypeRepo.findAllById(req.getServiceIds());
            if (services.size() != req.getServiceIds().size()) {
                throw new EntityNotFoundException("One or more services not found");
            }
            appt.setServices(services);
        }
        Appointment saved = repo.save(appt);
        return enrich(saved);
    }

    @Override
    public AppointmentResponseDTO updateStatus(Long id, String status) {
        Appointment appt = repo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        appt.setStatus(BookingStatus.valueOf(status));
        if (appt.getStatus() == BookingStatus.COMPLETED) {
            appt.setActualEndTime(LocalDateTime.now());
        }
        Appointment saved = repo.save(appt);
        return enrich(saved);
    }

    @Override
    public void cancel(Long id) {
        updateStatus(id, BookingStatus.CANCELLED.name());
    }

    @Override
    public void complete(Long id) {
        updateStatus(id, BookingStatus.COMPLETED.name());
    }

    @Override
    public AppointmentResponseDTO publicBook(BookingRequestDTO req) {
        // Step 1: Find or create customer
        Customer customer = findOrCreateCustomer(req);
        
        // Step 2: Get services
        List<Long> serviceIdList = req.getServiceIdList();
        if (serviceIdList.isEmpty()) {
            throw new IllegalArgumentException("At least one service must be selected");
        }
        List<ServiceType> services = serviceTypeRepo.findAllById(serviceIdList);
        if (services.size() != serviceIdList.size()) {
            throw new EntityNotFoundException("One or more services not found");
        }
        
        // Step 3: Create appointment
        Appointment appt = new Appointment();
        appt.setCustomer(customer);
        appt.setServices(services);
        appt.setStartTime(req.getScheduledTime());
        appt.setStatus(BookingStatus.PENDING);
        
        // Step 4: Set employee if provided
        if (req.getStaffId() != null) {
            appt.setEmployee(employeeRepo.findById(req.getStaffId())
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with ID: " + req.getStaffId())));
        }
        
        // Step 5: Check for conflicts if employee is assigned
        int totalEstimate = services.stream()
            .mapToInt(ServiceType::getEstimatedDurationMinutes)
            .sum();
        if (appt.getEmployee() != null) {
            List<Appointment> conflicts = repo.findByEmployeeIdAndStartTimeBetween(
                appt.getEmployee().getId(), 
                appt.getStartTime(), 
                appt.getStartTime().plusMinutes(totalEstimate)
            );
            if (!conflicts.isEmpty()) {
                throw new IllegalStateException("The selected time slot is already booked for this staff member");
            }
        }
        
        // Step 6: Save and return
        Appointment saved = repo.save(appt);
        AppointmentResponseDTO response = mapper.toResponse(saved);
        response.setTotalEstimatedDuration(totalEstimate);
        return response;
    }
    
    /**
     * Find existing customer by email or phone, or create a new one.
     */
    private Customer findOrCreateCustomer(BookingRequestDTO req) {
        // Try to find by email first
        if (req.getCustomerEmail() != null && !req.getCustomerEmail().isBlank()) {
            Customer existing = customerRepo.findByEmail(req.getCustomerEmail());
            if (existing != null) {
                return existing;
            }
        }
        
        // Create new customer (as guest if no email provided)
        Customer customer = new Customer();
        customer.setName(req.getCustomerName());
        customer.setEmail(req.getCustomerEmail());
        customer.setPhoneNumber(req.getCustomerPhone());
        customer.setGuest(req.getCustomerEmail() == null || req.getCustomerEmail().isBlank());
        customer.setNote(req.getNotes());
        
        return customerRepo.save(customer);
    }

    private AppointmentResponseDTO enrich(Appointment appt) {
        AppointmentResponseDTO response = mapper.toResponse(appt);
        int totalEstimate = appt.getServices().stream()
            .mapToInt(ServiceType::getEstimatedDurationMinutes)
            .sum();
        response.setTotalEstimatedDuration(totalEstimate);
        return response;
    }
}