package com.salonhub.api.queue.repository;

import com.salonhub.api.queue.model.Queue;
import com.salonhub.api.queue.model.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueRepository extends JpaRepository<Queue, Long> {
    
    // Find all entries by status ordered by created time
    List<Queue> findByStatusOrderByCreatedAtAsc(QueueStatus status);
    
    // Find queue entries for today by created time
    @Query("SELECT q FROM Queue q WHERE DATE(q.createdAt) = DATE(:date) ORDER BY q.createdAt ASC")
    List<Queue> findByCreatedAtDate(@Param("date") LocalDateTime date);
    
    // Find current waiting customers
    @Query("SELECT q FROM Queue q WHERE q.status = 'WAITING' ORDER BY q.createdAt ASC")
    List<Queue> findCurrentQueue();
    
    // Count waiting customers ahead of a specific entry
    @Query("SELECT COUNT(q) FROM Queue q WHERE q.status = 'WAITING' AND q.createdAt < :createdAt")
    Long countWaitingAhead(@Param("createdAt") LocalDateTime createdAt);
    
    // Find queue entry by customer ID and status
    @Query("SELECT q FROM Queue q WHERE q.customerId = :customerId AND q.status = :status")
    List<Queue> findByCustomerIdAndStatus(@Param("customerId") Long customerId, @Param("status") QueueStatus status);
    
    // Find maximum queue number for the day
    @Query("SELECT MAX(q.queueNumber) FROM Queue q WHERE CAST(q.createdAt AS DATE) = CAST(CURRENT_DATE AS DATE)")
    Optional<Integer> findMaxQueueNumber();
    
    // Find queue entries by employee ID
    @Query("SELECT q FROM Queue q WHERE q.employeeId = :employeeId")
    List<Queue> findByEmployeeId(@Param("employeeId") Long employeeId);
}
