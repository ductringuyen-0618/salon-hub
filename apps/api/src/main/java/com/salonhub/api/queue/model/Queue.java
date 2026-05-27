package com.salonhub.api.queue.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "queue")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Queue {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "customer_id", nullable = false)
    private Long customerId;
    
    @Column(name = "employee_id")
    private Long employeeId;
    
    @Column(name = "appointment_id")
    private Long appointmentId;
    
    @Column(name = "queue_number", nullable = false)
    private Integer queueNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QueueStatus status = QueueStatus.WAITING;
    
    @Column(name = "estimated_wait_time")
    private Integer estimatedWaitTime;
    
    @Column(name = "position")
    private Integer position;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public Queue(Long customerId, Long employeeId, Long appointmentId, Integer queueNumber, QueueStatus status, Integer estimatedWaitTime, String notes) {
        this.customerId = customerId;
        this.employeeId = employeeId;
        this.appointmentId = appointmentId;
        this.queueNumber = queueNumber;
        this.status = status != null ? status : QueueStatus.WAITING;
        this.estimatedWaitTime = estimatedWaitTime;
        this.notes = notes;
    }
    
    public Queue(Long customerId, String notes) {
        this.customerId = customerId;
        this.notes = notes;
        this.status = QueueStatus.WAITING;
    }
}
