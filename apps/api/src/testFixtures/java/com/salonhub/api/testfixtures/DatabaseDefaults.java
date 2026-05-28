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
        // Multi-tenant — seed the default tenant first so FK constraints
        // on tenant_id (added by V10) don't blow up. Existing test data
        // lives under tenant_id=1.
        ensureDefaultTenant(jdbc);
        CustomerDatabaseDefault.seed(jdbc);
        EmployeeDatabaseDefault.seed(jdbc);
        QueueDatabaseDefault.seed(jdbc);
    }

    private static void ensureDefaultTenant(JdbcTemplate jdbc) {
        try {
            Integer tenantCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM tenants WHERE id = 1", Integer.class);
            if (tenantCount != null && tenantCount > 0) return;
            jdbc.execute(
                "INSERT INTO tenants (id, slug, name, active) VALUES (1, 'default', 'Default Salon', true)");
        } catch (Exception e) {
            // Tenants table doesn't exist yet (e.g. H2 unit tests with
            // create-drop pre-entity-listener wiring). Skip silently.
        }
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
        // Leave tenants table alone — it's seeded once.
    }
}
