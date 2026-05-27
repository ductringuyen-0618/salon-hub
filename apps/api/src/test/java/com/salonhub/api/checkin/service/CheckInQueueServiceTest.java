package com.salonhub.api.checkin.service;

import com.salonhub.api.checkin.dto.CheckInRequestDTO;
import com.salonhub.api.checkin.dto.CheckInResponseDTO;
import com.salonhub.api.customer.model.Customer;
import com.salonhub.api.customer.repository.CustomerRepository;
import com.salonhub.api.queue.model.Queue;
import com.salonhub.api.queue.model.QueueStatus;
import com.salonhub.api.queue.service.QueueService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit test to verify the connection between check-in service and queue service.
 * This test ensures that when customers check in, they are properly added to the queue.
 */
@ExtendWith(MockitoExtension.class)
class CheckInQueueServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private QueueService queueService;

    @InjectMocks
    private CheckInService checkInService;

    private Customer mockCustomer;
    private Queue mockQueueEntry;
    private CheckInRequestDTO guestRequest;
    private CheckInRequestDTO existingRequest;

    @BeforeEach
    void setUp() {
        // Setup mock customer
        mockCustomer = new Customer();
        mockCustomer.setId(1L);
        mockCustomer.setName("Test Customer");
        mockCustomer.setPhoneNumber("555-0123");
        mockCustomer.setEmail("test@example.com");
        mockCustomer.setGuest(false);

        // Setup mock queue entry
        mockQueueEntry = new Queue();
        mockQueueEntry.setId(100L);
        mockQueueEntry.setCustomerId(1L);
        mockQueueEntry.setQueueNumber(5);
        mockQueueEntry.setStatus(QueueStatus.WAITING);
        mockQueueEntry.setPosition(1);
        mockQueueEntry.setEstimatedWaitTime(15);
        mockQueueEntry.setCreatedAt(LocalDateTime.now());

        // Setup requests
        guestRequest = new CheckInRequestDTO();
        guestRequest.setName("Guest Customer");
        guestRequest.setPhoneNumber("555-0456");
        guestRequest.setGuest(true);
        guestRequest.setNote("Walk-in guest");

        existingRequest = new CheckInRequestDTO();
        existingRequest.setContact("test@example.com");  // Use setContact instead of setPhoneOrEmail
        existingRequest.setGuest(false);
    }

    @Test
    void checkInGuest_shouldCreateCustomerAndAddToQueue() {
        // Given
        Customer savedCustomer = new Customer();
        savedCustomer.setId(2L);
        savedCustomer.setName("Guest Customer");
        savedCustomer.setPhoneNumber("555-0456");
        savedCustomer.setGuest(true);

        Queue savedQueueEntry = new Queue();
        savedQueueEntry.setId(101L);
        savedQueueEntry.setCustomerId(2L);
        savedQueueEntry.setPosition(1);
        savedQueueEntry.setEstimatedWaitTime(20);
        savedQueueEntry.setCreatedAt(LocalDateTime.now());

        when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);
        when(queueService.addToQueue(any(Queue.class))).thenReturn(savedQueueEntry);

        // When
        CheckInResponseDTO response = checkInService.checkIn(guestRequest);

        // Then
        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals("Guest Customer", response.getName());
        assertEquals("555-0456", response.getPhoneNumber());
        assertTrue(response.isGuest());
        assertEquals(101L, response.getQueueId());
        assertEquals(1, response.getQueuePosition());
        assertEquals(20, response.getEstimatedWaitTime());
        assertEquals("Check-in successful! You've been added to the queue.", response.getMessage());

        // Verify interactions
        verify(customerRepository).save(any(Customer.class));
        verify(queueService).addToQueue(any(Queue.class));
    }

    @Test
    void checkInExistingCustomer_shouldFindCustomerAndAddToQueue() {
        // Given
        when(customerRepository.findByPhoneOrEmail(anyString(), anyString()))
            .thenReturn(Optional.of(mockCustomer));
        when(queueService.addToQueue(any(Queue.class))).thenReturn(mockQueueEntry);

        // When
        CheckInResponseDTO response = checkInService.checkIn(existingRequest);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Test Customer", response.getName());
        assertEquals("555-0123", response.getPhoneNumber());
        assertEquals("test@example.com", response.getEmail());
        assertFalse(response.isGuest());
        assertEquals(100L, response.getQueueId());
        assertEquals(1, response.getQueuePosition());
        assertEquals(15, response.getEstimatedWaitTime());
        assertEquals("Check-in successful! You've been added to the queue.", response.getMessage());

        // Verify interactions - the service should pass contact info and empty string for email field
        verify(customerRepository).findByPhoneOrEmail("test@example.com", "");
        verify(queueService).addToQueue(any(Queue.class));
    }

    @Test
    void checkInCustomer_shouldPassCorrectQueueEntry() {
        // Given
        when(customerRepository.findByPhoneOrEmail(anyString(), anyString()))
            .thenReturn(Optional.of(mockCustomer));
        when(queueService.addToQueue(any(Queue.class))).thenReturn(mockQueueEntry);

        // When
        checkInService.checkIn(existingRequest);

        // Then - Verify the queue entry passed to the service has correct properties
        verify(queueService).addToQueue(argThat(queue -> 
            queue.getCustomerId().equals(1L) &&
            queue.getStatus() == QueueStatus.WAITING &&
            queue.getNotes().equals("Walk-in customer")
        ));
    }

    @Test
    void checkInNonExistentCustomer_shouldThrowException() {
        // Given
        when(customerRepository.findByPhoneOrEmail(anyString(), anyString()))
            .thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> checkInService.checkIn(existingRequest)
        );

        assertEquals("Customer not found with provided contact information", exception.getMessage());  // Updated expected message
        verify(queueService, never()).addToQueue(any(Queue.class));
    }

    @Test
    void checkInWithNote_shouldPassNoteToQueue() {
        // Given
        guestRequest.setNote("Special assistance needed");
        
        Customer savedCustomer = new Customer();
        savedCustomer.setId(3L);
        savedCustomer.setName("Guest Customer");
        savedCustomer.setPhoneNumber("555-0456");
        savedCustomer.setGuest(true);

        when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);
        when(queueService.addToQueue(any(Queue.class))).thenReturn(mockQueueEntry);

        // When
        checkInService.checkIn(guestRequest);

        // Then - Verify the note is passed to the queue
        verify(queueService).addToQueue(argThat(queue -> 
            queue.getNotes().equals("Special assistance needed")
        ));
    }
}
