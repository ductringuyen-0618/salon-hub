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
    private final WaitTimeEstimator waitTimeEstimator;
    
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
            // Use the customer's chosen service + preferred tech (if any)
            // so the estimate they see at check-in matches the simulation.
            queueEntry.setEstimatedWaitTime(
                waitTimeEstimator.estimateForNewArrival(
                    queueEntry.getServiceTypeId(),
                    queueEntry.getEmployeeId()
                )
            );
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
        // Smart estimate: simulates the queue draining against the actual
        // number of available technicians AND their upcoming appointments,
        // instead of the old position×30 minutes formula that pretended
        // there was only one tech in the salon. See WaitTimeEstimator.
        return waitTimeEstimator.estimateForNewArrival();
    }

    @Override
    @Transactional
    public void updateQueuePositions() {
        // Recompute position + estimatedWaitTime for every WAITING entry
        // using the parallel-tech scheduler simulation. The estimator
        // mutates the entities in place; persist them in a single batch.
        List<Queue> waiting = waitTimeEstimator.recalculateWaitingQueue();
        for (Queue q : waiting) {
            queueRepository.save(q);
        }
    }
    
    @Override
    public QueueStatistics getQueueStatistics() {
        List<Queue> waitingCustomers = queueRepository.findByStatusOrderByCreatedAtAsc(QueueStatus.WAITING);
        int totalWaiting = waitingCustomers.size();

        // The check-in page labels averageWaitTime as "Current Wait" —
        // i.e. "if I walk in right now, how long until I'm seen?". So we
        // expose the new-arrival estimate from the simulator (which is
        // aware of parallel techs and their appointment books) instead of
        // averaging stale per-entry numbers.
        int currentWaitForNewArrival = waitTimeEstimator.estimateForNewArrival();

        // Longest wait = real elapsed time of the longest-waiting customer
        // (so the front-desk can see who's been there the longest).
        int longestWait = waitingCustomers.stream()
                .mapToInt(q -> (int) Duration.between(q.getCreatedAt(), LocalDateTime.now()).toMinutes())
                .max()
                .orElse(0);

        return new QueueStatistics(totalWaiting, currentWaitForNewArrival, longestWait);
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
