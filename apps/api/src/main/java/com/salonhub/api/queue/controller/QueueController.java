package com.salonhub.api.queue.controller;

import com.salonhub.api.queue.dto.QueueEntryDTO;
import com.salonhub.api.queue.dto.QueueUpdateDTO;
import com.salonhub.api.queue.model.QueueStatus;
import com.salonhub.api.queue.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Queue Controller with role-based permissions:
 * - VIEW queue: All authenticated users can view queue
 * - MODIFY queue: FRONT_DESK, MANAGER, ADMIN
 * - STATS: MANAGER, ADMIN
 */
@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController {
    
    private final QueueService queueService;
    
    /**
     * Get current queue (waiting customers)
     * Updated endpoint: GET /api/queue
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<QueueEntryDTO>> getCurrentQueue() {
        List<QueueEntryDTO> queue = queueService.getCurrentQueue();
        return ResponseEntity.ok(queue);
    }
    
    /**
     * Get specific queue entry
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QueueEntryDTO> getQueueEntry(@PathVariable Long id) {
        try {
            QueueEntryDTO entry = queueService.getQueueEntry(id);
            return ResponseEntity.ok(entry);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update queue entry
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public ResponseEntity<QueueEntryDTO> updateQueueEntry(
            @PathVariable Long id, 
            @RequestBody QueueUpdateDTO updateDTO) {
        try {
            QueueEntryDTO updated = queueService.updateQueueEntry(id, updateDTO);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Remove customer from queue
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Void> removeFromQueue(@PathVariable Long id) {
        try {
            queueService.removeFromQueue(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update queue entry status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public ResponseEntity<QueueEntryDTO> updateQueueStatus(
            @PathVariable Long id, 
            @RequestParam String status) {
        try {
            QueueStatus queueStatus = QueueStatus.valueOf(status.toUpperCase());
            QueueEntryDTO updated = queueService.updateQueueStatus(id, queueStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get queue statistics
     * PUBLIC endpoint - used by check-in page to show wait times
     */
    @GetMapping("/stats")
    public ResponseEntity<QueueService.QueueStatistics> getQueueStatistics() {
        QueueService.QueueStatistics stats = queueService.getQueueStatistics();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Refresh queue positions
     */
    @PostMapping("/refresh")
    @PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Void> refreshQueuePositions() {
        queueService.updateQueuePositions();
        return ResponseEntity.ok().build();
    }
}
