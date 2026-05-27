package com.salonhub.api.queue.service;

import com.salonhub.api.queue.dto.QueueEntryDTO;
import com.salonhub.api.queue.dto.QueueUpdateDTO;
import com.salonhub.api.queue.model.Queue;
import com.salonhub.api.queue.model.QueueStatus;
import com.salonhub.api.queue.repository.QueueRepository;
import com.salonhub.api.customer.model.Customer;
import com.salonhub.api.customer.repository.CustomerRepository;
import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QueueServiceImpl implements QueueService {
    
    private final QueueRepository queueRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final QueueNotificationService notificationService;
    
    @Override
    @Transactional
    public Queue addToQueue(Queue queueEntry) {
        // Set queue number
        Integer nextQueueNumber = getNextQueueNumber();
        queueEntry.setQueueNumber(nextQueueNumber);
        
        // Calculate position and estimated wait time
        Integer position = getCurrentQueueSize() + 1;
        queueEntry.setPosition(position);
        
        if (queueEntry.getEstimatedWaitTime() == null) {
            queueEntry.setEstimatedWaitTime(calculateEstimatedWaitTime());
        }
        
        Queue saved = queueRepository.save(queueEntry);
        
        // Broadcast queue update via WebSocket
        broadcastQueueUpdate();
        
        return saved;
    }
    
    @Override
    public List<QueueEntryDTO> getCurrentQueue() {
        List<Queue> queueEntries = queueRepository.findCurrentQueue();
        return queueEntries.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public QueueEntryDTO getQueueEntry(Long id) {
        Queue queue = queueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Queue entry not found with id: " + id));
        return convertToDTO(queue);
    }
    
    @Override
    @Transactional
    public QueueEntryDTO updateQueueEntry(Long id, QueueUpdateDTO updateDTO) {
        Queue queue = queueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Queue entry not found with id: " + id));
        
        if (updateDTO.getEmployeeId() != null) {
            queue.setEmployeeId(updateDTO.getEmployeeId());
        }
        
        if (updateDTO.getEstimatedWaitTime() != null) {
            queue.setEstimatedWaitTime(updateDTO.getEstimatedWaitTime());
        }
        
        if (updateDTO.getNotes() != null) {
            queue.setNotes(updateDTO.getNotes());
        }
        
        if (updateDTO.getStatus() != null) {
            queue.setStatus(QueueStatus.valueOf(updateDTO.getStatus()));
        }
        
        Queue saved = queueRepository.save(queue);
        
        // Update positions if status changed
        if (updateDTO.getStatus() != null) {
            updateQueuePositions();
        }
        
        // Broadcast queue update via WebSocket
        broadcastQueueUpdate();
        
        return convertToDTO(saved);
    }
    
    @Override
    @Transactional
    public void removeFromQueue(Long id) {
        queueRepository.deleteById(id);
        updateQueuePositions();
        
        // Broadcast queue update via WebSocket
        notificationService.broadcastEntryRemoved(id);
        broadcastQueueUpdate();
    }
    
    @Override
    @Transactional
    public QueueEntryDTO updateQueueStatus(Long id, QueueStatus status) {
        Queue queue = queueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Queue entry not found with id: " + id));
        
        queue.setStatus(status);
        Queue saved = queueRepository.save(queue);
        
        updateQueuePositions();
        
        // Broadcast queue update via WebSocket
        broadcastQueueUpdate();
        
        return convertToDTO(saved);
    }
    
    @Override
    public Integer calculateEstimatedWaitTime() {
        List<Queue> waitingCustomers = queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING);
        
        if (waitingCustomers.isEmpty()) {
            return 15; // Base wait time
        }
        
        // Average 30 minutes per customer + current queue
        int baseTimePerCustomer = 30;
        return baseTimePerCustomer * waitingCustomers.size();
    }
    
    @Override
    @Transactional
    public void updateQueuePositions() {
        List<Queue> waitingCustomers = queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING);
        
        for (int i = 0; i < waitingCustomers.size(); i++) {
            Queue customer = waitingCustomers.get(i);
            customer.setPosition(i + 1);
            
            // Update estimated wait time based on position
            customer.setEstimatedWaitTime((i + 1) * 30); // 30 minutes per person ahead
            
            queueRepository.save(customer);
        }
    }
    
    @Override
    public QueueStatistics getQueueStatistics() {
        List<Queue> waitingCustomers = queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING);
        
        if (waitingCustomers.isEmpty()) {
            return new QueueStatistics(0, 0, 0);
        }
        
        int totalWaiting = waitingCustomers.size();
        int averageWaitTime = waitingCustomers.stream()
                .mapToInt(Queue::getEstimatedWaitTime)
                .sum() / totalWaiting;
        
        // Calculate longest wait (time since created)
        int longestWait = waitingCustomers.stream()
                .mapToInt(q -> (int) Duration.between(q.getCreatedAt(), LocalDateTime.now()).toMinutes())
                .max()
                .orElse(0);
        
        return new QueueStatistics(totalWaiting, averageWaitTime, longestWait);
    }
    
    private int getCurrentQueueSize() {
        return queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING).size();
    }
    
    private Integer getNextQueueNumber() {
        return queueRepository.findMaxQueueNumber()
                .map(max -> max + 1)
                .orElse(1);
    }
    
    private QueueEntryDTO convertToDTO(Queue queue) {
        QueueEntryDTO dto = new QueueEntryDTO();
        dto.setId(queue.getId());
        dto.setQueueNumber(queue.getQueueNumber());
        dto.setCustomerId(queue.getCustomerId());
        dto.setEmployeeId(queue.getEmployeeId());
        dto.setAppointmentId(queue.getAppointmentId());
        dto.setEstimatedWaitTime(queue.getEstimatedWaitTime());
        dto.setStatus(queue.getStatus());
        dto.setPosition(queue.getPosition());
        dto.setNotes(queue.getNotes());
        dto.setCreatedAt(queue.getCreatedAt());
        dto.setUpdatedAt(queue.getUpdatedAt());
        
        // Load customer details
        if (queue.getCustomerId() != null) {
            Customer customer = customerRepository.findById(queue.getCustomerId()).orElse(null);
            if (customer != null) {
                dto.setCustomerName(customer.getName());
                dto.setCustomerEmail(customer.getEmail());
                dto.setCustomerPhone(customer.getPhoneNumber());
            }
        }
        
        // Load employee details
        if (queue.getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(queue.getEmployeeId()).orElse(null);
            if (employee != null) {
                dto.setEmployeeName(employee.getName());
            }
        }
        
        return dto;
    }
    
    /**
     * Broadcast the current queue state to all WebSocket subscribers.
     */
    private void broadcastQueueUpdate() {
        try {
            List<QueueEntryDTO> currentQueue = getCurrentQueue();
            notificationService.broadcastQueueUpdate(currentQueue);
            notificationService.broadcastQueueStats(getQueueStatistics());
        } catch (Exception e) {
            // Log but don't fail the main operation if broadcast fails
            // This could happen if WebSocket infrastructure isn't ready
        }
    }
}
