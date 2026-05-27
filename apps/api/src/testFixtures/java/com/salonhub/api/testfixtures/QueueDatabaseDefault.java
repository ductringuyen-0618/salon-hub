package com.salonhub.api.testfixtures;

import org.springframework.jdbc.core.JdbcTemplate;
import com.salonhub.api.queue.model.Queue;
import com.salonhub.api.queue.model.QueueStatus;
import java.util.List;
import java.util.stream.Collectors;

public class QueueDatabaseDefault {
    
    // Queue Entry IDs
    public static final Long QUEUE_ID_1 = 1L;
    public static final Long QUEUE_ID_2 = 2L;
    public static final Long QUEUE_ID_3 = 3L;
    
    // Queue Numbers
    public static final Integer QUEUE_NUMBER_1 = 1;
    public static final Integer QUEUE_NUMBER_2 = 2;
    public static final Integer QUEUE_NUMBER_3 = 3;
    
    // Queue Entries - using the correct constructor
    public static final Queue QUEUE_ENTRY_1 = new Queue(
        CustomerDatabaseDefault.JANE_ID, 
        EmployeeDatabaseDefault.ALICE_ID,
        null, // no appointment
        QUEUE_NUMBER_1,
        QueueStatus.WAITING,
        15,
        "Walk-in customer"
    );
    
    public static final Queue QUEUE_ENTRY_2 = new Queue(
        CustomerDatabaseDefault.JOHN_ID,
        EmployeeDatabaseDefault.BOB_ID,
        null, // no appointment
        QUEUE_NUMBER_2,
        QueueStatus.IN_PROGRESS,
        0,
        "Regular customer"
    );
    
    public static final Queue QUEUE_ENTRY_3 = new Queue(
        CustomerDatabaseDefault.JANE_ID,
        null, // no assigned employee yet
        null, // no appointment
        QUEUE_NUMBER_3,
        QueueStatus.WAITING,
        25,
        "Waiting for available stylist"
    );
    
    // Set IDs manually for test fixtures
    static {
        QUEUE_ENTRY_1.setId(QUEUE_ID_1);
        QUEUE_ENTRY_2.setId(QUEUE_ID_2);
        QUEUE_ENTRY_3.setId(QUEUE_ID_3);
    }
    
    public static final List<Queue> QUEUE_LIST = List.of(QUEUE_ENTRY_1, QUEUE_ENTRY_2, QUEUE_ENTRY_3);
    
    public static final List<String> SQL = QUEUE_LIST.stream()
        .map(q -> String.format(
            "INSERT INTO queue (id, customer_id, employee_id, appointment_id, queue_number, status, estimated_wait_time, notes) VALUES (%d, %d, %s, %s, %d, '%s', %s, '%s');",
            q.getId(), 
            q.getCustomerId(), 
            q.getEmployeeId() != null ? q.getEmployeeId().toString() : "NULL",
            q.getAppointmentId() != null ? q.getAppointmentId().toString() : "NULL",
            q.getQueueNumber(),
            q.getStatus().name(),
            q.getEstimatedWaitTime() != null ? q.getEstimatedWaitTime().toString() : "NULL",
            q.getNotes() != null ? q.getNotes() : ""
        ))
        .collect(Collectors.toList());
    
    public static void seed(JdbcTemplate jdbc) {
        SQL.forEach(jdbc::execute);
    }
}
