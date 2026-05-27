package com.salonhub.api.queue.service;

import com.salonhub.api.queue.dto.QueueEntryDTO;
import com.salonhub.api.queue.dto.QueueUpdateDTO;
import com.salonhub.api.queue.model.Queue;
import com.salonhub.api.queue.model.QueueStatus;

import java.util.List;

public interface QueueService {
    
    /**
     * Add a customer to the queue
     */
    Queue addToQueue(Queue queueEntry);
    
    /**
     * Get current queue (waiting customers)
     */
    List<QueueEntryDTO> getCurrentQueue();
    
    /**
     * Get queue entry by ID
     */
    QueueEntryDTO getQueueEntry(Long id);
    
    /**
     * Update queue entry
     */
    QueueEntryDTO updateQueueEntry(Long id, QueueUpdateDTO updateDTO);
    
    /**
     * Remove customer from queue
     */
    void removeFromQueue(Long id);
    
    /**
     * Update queue entry status
     */
    QueueEntryDTO updateQueueStatus(Long id, QueueStatus status);
    
    /**
     * Calculate estimated wait time for a new customer
     */
    Integer calculateEstimatedWaitTime();
    
    /**
     * Update positions for all waiting customers
     */
    void updateQueuePositions();
    
    /**
     * Get queue statistics
     */
    QueueStatistics getQueueStatistics();
    
    /**
     * Inner class for queue statistics
     */
    class QueueStatistics {
        public final int totalWaiting;
        public final int averageWaitTime;
        public final int longestWait;
        
        public QueueStatistics(int totalWaiting, int averageWaitTime, int longestWait) {
            this.totalWaiting = totalWaiting;
            this.averageWaitTime = averageWaitTime;
            this.longestWait = longestWait;
        }
    }
}
