package com.salonhub.api.checkin.service;

import com.salonhub.api.checkin.dto.CheckInRequestDTO;
import com.salonhub.api.checkin.dto.CheckInResponseDTO;
import com.salonhub.api.customer.model.Customer;
import com.salonhub.api.customer.repository.CustomerRepository;
import com.salonhub.api.queue.model.Queue;
import com.salonhub.api.queue.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CheckInService {

    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private QueueService queueService;

    /**
     * Unified check-in method that handles both guest and existing customer check-ins
     * Now integrates with queue system
     */
    @Transactional
    public CheckInResponseDTO checkIn(CheckInRequestDTO request) {
        Customer customer;
        String contactInfo = request.getPhoneOrEmail();
        
        if (request.isGuest()) {
            customer = createGuestCustomer(request);
        } else {
            customer = findExistingCustomer(request);
        }
        
        // Add customer to queue
        Queue queueEntry = new Queue(
            customer.getId(),
            request.getNote() != null ? request.getNote() : "Walk-in customer"
        );
        
        Queue savedQueueEntry = queueService.addToQueue(queueEntry);
        
        return new CheckInResponseDTO(
            customer.getId(),
            customer.getName(),
            customer.getPhoneNumber(),
            customer.getEmail(),
            customer.getNote(),
            customer.isGuest(),
            savedQueueEntry.getCreatedAt(),
            "Check-in successful! You've been added to the queue.",
            savedQueueEntry.getEstimatedWaitTime(),
            savedQueueEntry.getPosition(),
            savedQueueEntry.getId()
        );
    }

    /**
     * Check in an existing customer by phone number or email
     */
    public CheckInResponseDTO checkInExistingCustomer(CheckInRequestDTO request) {
        Customer customer = findExistingCustomer(request);
        
        // Add to queue
        Queue queueEntry = new Queue(
            customer.getId(),
            "Existing customer check-in"
        );
        
        Queue savedQueueEntry = queueService.addToQueue(queueEntry);
        
        return new CheckInResponseDTO(
            customer.getId(),
            customer.getName(),
            customer.getPhoneNumber(),
            customer.getEmail(),
            customer.getNote(),
            customer.isGuest(),
            savedQueueEntry.getCreatedAt(),
            "Existing customer checked in successfully",
            savedQueueEntry.getEstimatedWaitTime(),
            savedQueueEntry.getPosition(),
            savedQueueEntry.getId()
        );
    }

    /**
     * Check in a guest user (creates a new customer record)
     */
    public CheckInResponseDTO checkInGuest(CheckInRequestDTO request) {
        Customer guest = createGuestCustomer(request);
        
        // Add to queue
        Queue queueEntry = new Queue(
            guest.getId(),
            "Guest check-in"
        );
        
        Queue savedQueueEntry = queueService.addToQueue(queueEntry);

        return new CheckInResponseDTO(
            guest.getId(),
            guest.getName(),
            guest.getPhoneNumber(),
            guest.getEmail(),
            guest.getNote(),
            guest.isGuest(),
            savedQueueEntry.getCreatedAt(),
            "Guest checked in successfully",
            savedQueueEntry.getEstimatedWaitTime(),
            savedQueueEntry.getPosition(),
            savedQueueEntry.getId()
        );
    }
    
    private Customer findExistingCustomer(CheckInRequestDTO request) {
        String contact = request.getContact();
        String email = request.getEmail();
        
        if ((contact == null || contact.trim().isEmpty()) && (email == null || email.trim().isEmpty())) {
            throw new IllegalArgumentException("Contact information is required");
        }
        
        // Try to find by phone number and email
        Optional<Customer> customerOpt = customerRepository.findByPhoneOrEmail(
            contact != null ? contact.trim() : "", 
            email != null ? email.trim() : ""
        );
        
        if (customerOpt.isPresent()) {
            return customerOpt.get();
        } else {
            throw new IllegalArgumentException("Customer not found with provided contact information");
        }
    }
    
    private Customer createGuestCustomer(CheckInRequestDTO request) {
        String contactInfo = request.getPhoneOrEmail();
        
        if (contactInfo == null || contactInfo.trim().isEmpty()) {
            throw new IllegalArgumentException("Contact information is required for guest check-in");
        }

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required for guest check-in");
        }

        // Check if a customer with this contact info already exists
        Optional<Customer> existingCustomer = customerRepository.findByPhoneOrEmail(contactInfo, contactInfo);

        if (existingCustomer.isPresent()) {
            throw new IllegalArgumentException("A customer with this contact information already exists. Use existing customer check-in instead.");
        }

        Customer guest = new Customer();
        guest.setName(request.getName().trim());
        
        // Set phone or email based on format
        if (request.isContactEmail()) {
            guest.setEmail(contactInfo);
            guest.setPhoneNumber(request.getPhoneNumber()); // May be null
        } else {
            guest.setPhoneNumber(contactInfo);
            guest.setEmail(request.getEmail()); // May be null
        }
        
        guest.setNote(request.getNote());
        guest.setGuest(true);

        return customerRepository.save(guest);
    }

    /**
     * Legacy method for backward compatibility
     */
    public Customer checkInExistingCustomer(String phoneOrEmail) {
        return customerRepository.findByPhoneOrEmail(phoneOrEmail, phoneOrEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
    }

    /**
     * Legacy method for backward compatibility
     */
    public Customer checkInGuest(String guestName, String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            throw new IllegalArgumentException("Phone number is required for guest check-in");
        }
        Customer guest = new Customer();
        guest.setName(guestName);
        guest.setPhoneNumber(phoneNumber);
        guest.setGuest(true);
        return customerRepository.save(guest);
    }

    public List<Customer> getTodayCheckedInGuests() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        return customerRepository.findAllByGuestTrueAndCreatedAtBetween(start, end);
    }
}