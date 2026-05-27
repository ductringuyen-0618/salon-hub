package com.salonhub.api.checkin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salonhub.api.checkin.dto.CheckInRequestDTO;
import com.salonhub.api.checkin.dto.CheckInResponseDTO;
import com.salonhub.api.queue.dto.QueueEntryDTO;
import com.salonhub.api.queue.model.QueueStatus;
import com.salonhub.api.testfixtures.ServerSetupExtension;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test to verify the connection between check-in and queue functionality.
 * This test ensures that when customers check in, they automatically appear in the queue.
 */
@SpringBootTest
@AutoConfigureWebMvc
@SpringJUnitConfig
@ServerSetupExtension
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Transactional
class CheckInQueueIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long guestCustomerId;
    private static Long existingCustomerId;
    private static Long guestQueueId;
    private static Long existingQueueId;

    @Test
    @Order(1)
    void checkInGuest_shouldCreateCustomerAndAddToQueue() throws Exception {
        // Given - Guest check-in request
        CheckInRequestDTO guestRequest = new CheckInRequestDTO();
        guestRequest.setName("John Guest");
        guestRequest.setPhoneNumber("555-0123");
        guestRequest.setGuest(true);
        guestRequest.setNote("First time visitor");

        // When - Guest checks in
        MvcResult result = mockMvc.perform(post("/api/checkin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(guestRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").exists())  // Use id instead of customerId
            .andExpect(jsonPath("$.name").value("John Guest"))
            .andExpect(jsonPath("$.phoneNumber").value("555-0123"))
            .andExpect(jsonPath("$.guest").value(true))
            .andExpect(jsonPath("$.message").value("Check-in successful! You've been added to the queue."))
            .andExpect(jsonPath("$.queueId").exists())
            .andExpect(jsonPath("$.queuePosition").exists())  // Use queuePosition instead of position
            .andExpect(jsonPath("$.estimatedWaitTime").exists())
            .andReturn();

        // Then - Extract IDs for later verification
        String responseJson = result.getResponse().getContentAsString();
        CheckInResponseDTO response = objectMapper.readValue(responseJson, CheckInResponseDTO.class);
        guestCustomerId = response.getId();  // Use getId() instead of getCustomerId()
        guestQueueId = response.getQueueId();

        assertNotNull(guestCustomerId, "Guest customer ID should not be null");
        assertNotNull(guestQueueId, "Guest queue ID should not be null");
        assertTrue(response.getQueuePosition() > 0, "Queue position should be positive");  // Use getQueuePosition()
    }

    @Test
    @Order(2)
    void checkInExistingCustomer_shouldAddToQueue() throws Exception {
        // Given - First create a customer (simulate existing customer)
        CheckInRequestDTO initialRequest = new CheckInRequestDTO();
        initialRequest.setName("Jane Existing");
        initialRequest.setPhoneNumber("555-0456");
        initialRequest.setEmail("jane@example.com");
        initialRequest.setGuest(false);

        // Create the customer first
        MvcResult createResult = mockMvc.perform(post("/api/checkin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(initialRequest)))
            .andExpect(status().isOk())
            .andReturn();

        CheckInResponseDTO createResponse = objectMapper.readValue(
            createResult.getResponse().getContentAsString(), CheckInResponseDTO.class);
        existingCustomerId = createResponse.getId();  // Use getId() instead of getCustomerId()
        existingQueueId = createResponse.getQueueId();

        // Verify existing customer was added to queue
        assertNotNull(existingCustomerId, "Existing customer ID should not be null");
        assertNotNull(existingQueueId, "Existing customer queue ID should not be null");
    }

    @Test
    @Order(3)
    void getQueue_shouldReturnAllCheckedInCustomers() throws Exception {
        // When - Get current queue
        MvcResult queueResult = mockMvc.perform(get("/api/queue")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2)) // Should have 2 customers from previous tests
            .andReturn();

        // Then - Verify both customers are in the queue
        String queueJson = queueResult.getResponse().getContentAsString();
        List<QueueEntryDTO> queueEntries = objectMapper.readValue(queueJson, 
            objectMapper.getTypeFactory().constructCollectionType(List.class, QueueEntryDTO.class));

        assertEquals(2, queueEntries.size(), "Queue should contain 2 customers");

        // Verify guest customer is in queue
        boolean guestFound = queueEntries.stream()
            .anyMatch(entry -> entry.getCustomerId().equals(guestCustomerId) &&
                             "John Guest".equals(entry.getCustomerName()) &&
                             QueueStatus.WAITING.equals(entry.getStatus()));
        assertTrue(guestFound, "Guest customer should be found in queue");

        // Verify existing customer is in queue
        boolean existingFound = queueEntries.stream()
            .anyMatch(entry -> entry.getCustomerId().equals(existingCustomerId) &&
                             "Jane Existing".equals(entry.getCustomerName()) &&
                             QueueStatus.WAITING.equals(entry.getStatus()));
        assertTrue(existingFound, "Existing customer should be found in queue");

        // Verify queue positions are sequential
        queueEntries.sort((a, b) -> a.getPosition().compareTo(b.getPosition()));
        assertEquals(1, queueEntries.get(0).getPosition(), "First customer should have position 1");
        assertEquals(2, queueEntries.get(1).getPosition(), "Second customer should have position 2");
    }

    @Test
    @Order(4)
    void checkInMultipleCustomers_shouldMaintainQueueOrder() throws Exception {
        // Given - Multiple check-in requests
        CheckInRequestDTO customer3 = new CheckInRequestDTO();
        customer3.setName("Bob Third");
        customer3.setPhoneNumber("555-0789");
        customer3.setGuest(true);

        CheckInRequestDTO customer4 = new CheckInRequestDTO();
        customer4.setName("Alice Fourth");
        customer4.setEmail("alice@example.com");
        customer4.setGuest(false);

        // When - Check in multiple customers
        mockMvc.perform(post("/api/checkin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customer3)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.queuePosition").value(3));

        mockMvc.perform(post("/api/checkin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customer4)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.queuePosition").value(4));

        // Then - Verify queue now has 4 customers in correct order
        MvcResult queueResult = mockMvc.perform(get("/api/queue"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(4))
            .andReturn();

        String queueJson = queueResult.getResponse().getContentAsString();
        List<QueueEntryDTO> queueEntries = objectMapper.readValue(queueJson, 
            objectMapper.getTypeFactory().constructCollectionType(List.class, QueueEntryDTO.class));

        // Sort by position for verification
        queueEntries.sort((a, b) -> a.getPosition().compareTo(b.getPosition()));

        assertEquals("John Guest", queueEntries.get(0).getCustomerName());
        assertEquals("Jane Existing", queueEntries.get(1).getCustomerName());
        assertEquals("Bob Third", queueEntries.get(2).getCustomerName());
        assertEquals("Alice Fourth", queueEntries.get(3).getCustomerName());
    }

    @Test
    @Order(5)
    void checkInSameCustomerTwice_shouldNotCreateDuplicateQueueEntry() throws Exception {
        // Given - Existing customer tries to check in again
        CheckInRequestDTO duplicateRequest = new CheckInRequestDTO();
        duplicateRequest.setPhoneNumber("555-0456"); // Same as Jane Existing
        duplicateRequest.setGuest(false);

        // When - Attempt duplicate check-in
        // This should either:
        // 1. Return error indicating customer already in queue, OR
        // 2. Update existing queue entry instead of creating new one
        
        // Current behavior - let's see what happens
        mockMvc.perform(post("/api/checkin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateRequest)))
            .andReturn(); // Don't assert status yet, check actual behavior

        // Then - Verify queue doesn't have duplicate entries
        mockMvc.perform(get("/api/queue"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(4)) // Should still be 4, not 5
            .andReturn();
    }

    @Test
    @Order(6)
    void verifyQueueEntryDetails_shouldContainCustomerInformation() throws Exception {
        // When - Get specific queue entry
        mockMvc.perform(get("/api/queue/{id}", guestQueueId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(guestQueueId))
            .andExpect(jsonPath("$.customerId").value(guestCustomerId))
            .andExpect(jsonPath("$.customerName").value("John Guest"))
            .andExpect(jsonPath("$.status").value("WAITING"))
            .andExpect(jsonPath("$.position").exists())
            .andExpect(jsonPath("$.estimatedWaitTime").exists())
            .andExpect(jsonPath("$.createdAt").exists());
    }
}
