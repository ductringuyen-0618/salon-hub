package com.salonhub.api.queue.service;

import com.salonhub.api.queue.dto.QueueEntryDTO;
import com.salonhub.api.queue.service.QueueService.QueueStatistics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for broadcasting real-time queue updates via WebSocket.
 * 
 * Broadcast Channels:
 * - /topic/queue - Full queue list updates
 * - /topic/queue/stats - Queue statistics updates
 * - /topic/queue/entry/{id} - Individual entry updates
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QueueNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast the entire queue to all subscribers.
     * Called after any queue modification (add, update, remove).
     */
    public void broadcastQueueUpdate(List<QueueEntryDTO> queue) {
        log.debug("Broadcasting queue update with {} entries", queue.size());
        messagingTemplate.convertAndSend("/topic/queue", queue);
    }

    /**
     * Broadcast queue statistics update.
     */
    public void broadcastQueueStats(QueueStatistics stats) {
        log.debug("Broadcasting queue stats: waiting={}, avgWait={}", 
                stats.totalWaiting, stats.averageWaitTime);
        messagingTemplate.convertAndSend("/topic/queue/stats", stats);
    }

    /**
     * Broadcast update for a specific queue entry.
     * Useful for targeted updates without sending entire queue.
     */
    public void broadcastEntryUpdate(QueueEntryDTO entry) {
        log.debug("Broadcasting entry update for queue entry id={}", entry.getId());
        messagingTemplate.convertAndSend("/topic/queue/entry/" + entry.getId(), entry);
    }

    /**
     * Broadcast when a customer is removed from queue.
     */
    public void broadcastEntryRemoved(Long entryId) {
        log.debug("Broadcasting entry removal for queue entry id={}", entryId);
        messagingTemplate.convertAndSend("/topic/queue/removed", entryId);
    }

    /**
     * Send notification to a specific user (authenticated WebSocket sessions).
     */
    public void sendToUser(String username, String destination, Object payload) {
        log.debug("Sending message to user {} at destination {}", username, destination);
        messagingTemplate.convertAndSendToUser(username, destination, payload);
    }
}
