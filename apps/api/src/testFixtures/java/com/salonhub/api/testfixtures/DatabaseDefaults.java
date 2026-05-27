package com.salonhub.api.testfixtures;

import org.springframework.jdbc.core.JdbcTemplate;

public class DatabaseDefaults {

    /**
     * Seed all tables with default data if not already seeded.
     */
    public static void seedAll(JdbcTemplate jdbc) {
        // Check if customers already seeded
        Integer custCount = jdbc.queryForObject("SELECT COUNT(*) FROM customers", Integer.class);
        if (custCount != null && custCount > 0) {
            return; // already initialized
        }
        CustomerDatabaseDefault.seed(jdbc);
        EmployeeDatabaseDefault.seed(jdbc);
        QueueDatabaseDefault.seed(jdbc);
    }

    /**
     * Clean up all seeded data after tests.
     */
    public static void cleanupAll(JdbcTemplate jdbc) {
        // Delete in dependency order
        jdbc.execute("DELETE FROM queue");
        jdbc.execute("DELETE FROM appointment_services");
        jdbc.execute("DELETE FROM appointments");
        jdbc.execute("DELETE FROM employees");
        jdbc.execute("DELETE FROM customers");
    }
}
