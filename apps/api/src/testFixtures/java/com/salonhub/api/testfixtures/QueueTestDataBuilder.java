package com.salonhub.api.testfixtures;

import com.salonhub.api.queue.dto.QueueEntryDTO;
import com.salonhub.api.queue.dto.QueueUpdateDTO;
import com.salonhub.api.queue.model.Queue;
import com.salonhub.api.queue.model.QueueStatus;

import java.time.LocalDateTime;

public class QueueTestDataBuilder {
    
    private Long id;
    private Long customerId;
    private Long employeeId;
    private Long appointmentId;
    private Integer queueNumber;
    private QueueStatus status;
    private Integer estimatedWaitTime;
    private Integer position;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static QueueTestDataBuilder aQueueEntry() {
        return new QueueTestDataBuilder()
            .withId(1L)
            .withCustomerId(CustomerDatabaseDefault.JANE_ID)
            .withEmployeeId(EmployeeDatabaseDefault.ALICE_ID)
            .withQueueNumber(1)
            .withStatus(QueueStatus.WAITING)
            .withEstimatedWaitTime(15)
            .withPosition(1)
            .withNotes("Test queue entry")
            .withCreatedAt(LocalDateTime.now())
            .withUpdatedAt(LocalDateTime.now());
    }
    
    public static QueueTestDataBuilder aWaitingQueueEntry() {
        return aQueueEntry()
            .withStatus(QueueStatus.WAITING)
            .withEstimatedWaitTime(30);
    }
    
    public static QueueTestDataBuilder anInProgressQueueEntry() {
        return aQueueEntry()
            .withStatus(QueueStatus.IN_PROGRESS)
            .withEstimatedWaitTime(0);
    }
    
    public QueueTestDataBuilder withId(Long id) {
        this.id = id;
        return this;
    }
    
    public QueueTestDataBuilder withCustomerId(Long customerId) {
        this.customerId = customerId;
        return this;
    }
    
    public QueueTestDataBuilder withEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
        return this;
    }
    
    public QueueTestDataBuilder withAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
        return this;
    }
    
    public QueueTestDataBuilder withQueueNumber(Integer queueNumber) {
        this.queueNumber = queueNumber;
        return this;
    }
    
    public QueueTestDataBuilder withStatus(QueueStatus status) {
        this.status = status;
        return this;
    }
    
    public QueueTestDataBuilder withEstimatedWaitTime(Integer estimatedWaitTime) {
        this.estimatedWaitTime = estimatedWaitTime;
        return this;
    }
    
    public QueueTestDataBuilder withPosition(Integer position) {
        this.position = position;
        return this;
    }
    
    public QueueTestDataBuilder withNotes(String notes) {
        this.notes = notes;
        return this;
    }
    
    public QueueTestDataBuilder withCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }
    
    public QueueTestDataBuilder withUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }
    
    public Queue build() {
        Queue queue = new Queue(customerId, employeeId, appointmentId, queueNumber, status, estimatedWaitTime, notes);
        queue.setId(id);
        queue.setPosition(position);
        queue.setCreatedAt(createdAt);
        queue.setUpdatedAt(updatedAt);
        return queue;
    }
    
    public QueueUpdateDTO buildUpdateDTO() {
        QueueUpdateDTO dto = new QueueUpdateDTO();
        dto.setEmployeeId(employeeId);
        dto.setEstimatedWaitTime(estimatedWaitTime);
        dto.setNotes(notes);
        if (status != null) {
            dto.setStatus(status.name());
        }
        return dto;
    }
    
    public QueueEntryDTO buildEntryDTO() {
        QueueEntryDTO dto = new QueueEntryDTO();
        dto.setId(id);
        dto.setCustomerId(customerId);
        dto.setEmployeeId(employeeId);
        dto.setAppointmentId(appointmentId);
        dto.setQueueNumber(queueNumber);
        dto.setStatus(status);
        dto.setEstimatedWaitTime(estimatedWaitTime);
        dto.setPosition(position);
        dto.setNotes(notes);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);
        return dto;
    }
}
