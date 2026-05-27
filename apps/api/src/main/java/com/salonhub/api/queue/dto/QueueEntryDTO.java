package com.salonhub.api.queue.dto;

import com.salonhub.api.queue.model.QueueStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QueueEntryDTO {
    private Long id;
    private Integer queueNumber;
    private Long customerId;
    private Long employeeId;
    private Long appointmentId;
    private Integer estimatedWaitTime;
    private QueueStatus status;
    private Integer position;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Customer information (populated from customer entity)
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    
    // Employee information (populated from employee entity)
    private String employeeName;
}
