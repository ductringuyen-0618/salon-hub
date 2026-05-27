package com.salonhub.api.queue.dto;

import lombok.Data;

@Data
public class QueueUpdateDTO {
    private Long employeeId;
    private Integer estimatedWaitTime;
    private String notes;
    private String status;
}
