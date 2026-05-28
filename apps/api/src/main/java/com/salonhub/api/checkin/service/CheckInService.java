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
        
        // Add customer to queue, stamping the preferred tech + chosen service
        // so the wait-time scheduler can use accurate durations and route
        // around customer preferences.
        Queue queueEntry = new Queue(
            customer.getId(),
            request.getNote() != null ? request.getNote() : "Walk-in customer"
        );
        queueEntry.setEmployeeId(request.getPreferredTechnicianId());
        queueEntry.setServiceTypeId(request.getServiceTypeId());

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
        
        // Add to queue with preferred tech + service stamped on the entry
        Queue queueEntry = new Queue(
            customer.getId(),
            "Existing customer check-in"
        );
        queueEntry.setEmployeeId(request.getPreferredTechnicianId());
        queueEntry.setServiceTypeId(request.getServiceTypeId());

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
        
        // Add to queue with preferred tech + service stamped on the entry
        Queue queueEntry = new Queue(
            guest.getId(),
            "Guest check-in"
        );
        queueEntry.setEmployeeId(request.getPreferredTechnicianId());
        queueEntry.setServiceTypeId(request.getServiceTypeId());

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

        // NOTE: We intentionally do NOT throw if a customer already exists
        // with this phone/email. Walk-in parties — a parent + kids, a couple,
        // friends — frequently share one phone number. Each party member
        // gets their own Customer row + queue entry; the schema allows
        // duplicate phone_number (it's not UNIQUE). The frontend posts one
        // /api/checkin per party member; the second+ POST would have
        // previously been rejected with 400.

        Customer guest = new Customer();
        guest.setName(request.getName().trim());

        // Normalize empty strings to null. Customer.email has a UNIQUE
        // constraint so we need null (not "") when no email is provided.
        if (request.isContactEmail()) {
            guest.setEmail(blankToNull(contactInfo));
            guest.setPhoneNumber(blankToNull(request.getPhoneNumber()));
        } else {
            guest.setPhoneNumber(blankToNull(contactInfo));
            guest.setEmail(blankToNull(request.getEmail()));
        }

        // For party members sharing an email: only the first guest with that
        // email gets to keep it; subsequent guests in the party have it
        // dropped to null so they don't collide on the UNIQUE index.
        // Phone is allowed to repeat (no UNIQUE constraint).
        if (guest.getEmail() != null) {
            Optional<Customer> emailOwner =
                customerRepository.findByPhoneOrEmail(guest.getEmail(), guest.getEmail());
            if (emailOwner.isPresent()) {
                guest.setEmail(null);
            }
        }

        guest.setNote(blankToNull(request.getNote()));
        guest.setGuest(true);

        return customerRepository.save(guest);
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
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