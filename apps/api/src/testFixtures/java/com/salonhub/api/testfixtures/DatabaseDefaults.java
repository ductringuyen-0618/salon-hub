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
        // By the time this runs, the Spring context backing this test class
        // has just finished booting — which means TestDataInitializer (a
        // CommandLineRunner) has already run too, and its seedEmployees()
        // inserts its own dev/E2E roster (Lisa Chen, Maria Garcia, ...) via
        // JPA auto-generated ids whenever the employees table is empty.
        // That collides with (or silently pre-empts) EmployeeDatabaseDefault's
        // fixed-id fixtures (ALICE_ID=1, BOB_ID=2) that these integration
        // tests actually reference by id and name. Clear it first so our
        // fixtures land deterministically.
        jdbc.execute("DELETE FROM employees");
        CustomerDatabaseDefault.seed(jdbc);
        EmployeeDatabaseDefault.seed(jdbc);
        QueueDatabaseDefault.seed(jdbc);
        // customers/employees/queue (above) and tenants (in ensureDefaultTenant)
        // were all seeded with explicit, hand-picked ids via raw SQL. Postgres
        // doesn't advance a BIGSERIAL column's sequence for an explicit-value
        // insert, so the next JPA-generated insert on any of these tables —
        // e.g. a test's own POST /api/customers — would try to reuse an id
        // that's already taken by these fixtures and fail with a constraint
        // violation. Resync each sequence to the current max id so new rows
        // get ids past the fixtures instead.
        resyncIdSequence(jdbc, "customers");
        resyncIdSequence(jdbc, "employees");
        resyncIdSequence(jdbc, "queue");
        resyncIdSequence(jdbc, "tenants");
    }

    private static void resyncIdSequence(JdbcTemplate jdbc, String table) {
        jdbc.execute(String.format(
            "SELECT setval(pg_get_serial_sequence('%s', 'id'), COALESCE((SELECT MAX(id) FROM %s), 1))",
            table, table));
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
