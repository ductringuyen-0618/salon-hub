package com.salonhub.api.queue.model;

public enum QueueStatus {
    WAITING,        // Customer is waiting in queue
    IN_PROGRESS,    // Customer is being served
    COMPLETED,      // Service completed
    CANCELLED,      // Customer cancelled or left
    NO_SHOW         // Customer didn't show up when called
}
