package com.salonhub.api.checkin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CheckInResponseDTO {

    private Long id;
    private String name;
    private String phoneNumber;
    private String email;
    private String note;
    private boolean guest;
    private LocalDateTime checkedInAt;
    private String message;
    
    // Queue-related fields that frontend expects
    private boolean success = true;
    private Integer estimatedWaitTime;
    private Integer queuePosition;
    private Long queueId;

    public CheckInResponseDTO(Long id, String name, String phoneNumber, String email, 
                             String note, boolean guest, LocalDateTime checkedInAt, String message) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.note = note;
        this.guest = guest;
        this.checkedInAt = checkedInAt;
        this.message = message;
        this.success = true;
    }
    
    // Constructor with queue information
    public CheckInResponseDTO(Long id, String name, String phoneNumber, String email, 
                             String note, boolean guest, LocalDateTime checkedInAt, String message,
                             Integer estimatedWaitTime, Integer queuePosition, Long queueId) {
        this(id, name, phoneNumber, email, note, guest, checkedInAt, message);
        this.estimatedWaitTime = estimatedWaitTime;
        this.queuePosition = queuePosition;
        this.queueId = queueId;
    }
}
