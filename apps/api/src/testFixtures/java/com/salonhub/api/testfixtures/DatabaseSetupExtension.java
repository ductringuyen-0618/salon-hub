package com.salonhub.api.testfixtures;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.extension.AfterAllCallback;
import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.springframework.context.ApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Sets up a real PostgreSQL Testcontainer for integration tests.
 */
public class DatabaseSetupExtension implements BeforeAllCallback, AfterAllCallback {

    public static final PostgreSQLContainer<?> POSTGRES_CONTAINER = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("salon_hub_test")
            .withUsername("test")
            .withPassword("test");

    @Override
    public void beforeAll(ExtensionContext context) {
        // Start PostgreSQL container
        POSTGRES_CONTAINER.start();

        // Inject dynamic datasource properties
        System.setProperty("spring.datasource.url", POSTGRES_CONTAINER.getJdbcUrl());
        System.setProperty("spring.datasource.username", POSTGRES_CONTAINER.getUsername());
        System.setProperty("spring.datasource.password", POSTGRES_CONTAINER.getPassword());
        System.setProperty("spring.datasource.driver-class-name", POSTGRES_CONTAINER.getDriverClassName());

        // Now run Flyway clean + migrate
        Flyway flyway = Flyway.configure()
                .dataSource(
                    POSTGRES_CONTAINER.getJdbcUrl(),
                    POSTGRES_CONTAINER.getUsername(),
                    POSTGRES_CONTAINER.getPassword()
                )
                .cleanDisabled(false)
                .load();

        flyway.clean();
        flyway.migrate();

        ApplicationContext appCtx = SpringExtension.getApplicationContext(context);
        JdbcTemplate jdbc = appCtx.getBean(JdbcTemplate.class);
        DatabaseDefaults.seedAll(jdbc);
    }

    @Override
    public void afterAll(ExtensionContext context) throws Exception {
        // Clean up database after all tests have run
        ApplicationContext appCtx = SpringExtension.getApplicationContext(context);
        JdbcTemplate jdbc = appCtx.getBean(JdbcTemplate.class);
        DatabaseDefaults.cleanupAll(jdbc);
    }
}