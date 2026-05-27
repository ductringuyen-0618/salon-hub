package com.salonhub.api.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Flyway configuration for production environment.
 * Handles the case where baseline was incorrectly set at version 1 
 * without actually running the V1 migration.
 */
@Configuration
@Profile("prod")
public class FlywayCleanupConfig {

    @Value("${flyway.force-clean:false}")
    private boolean forceClean;

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            // If FLYWAY_FORCE_CLEAN is set, clean the database first
            if (forceClean) {
                System.out.println("[FLYWAY] Force clean enabled - cleaning database...");
                flyway.clean();
            }
            
            // First, repair to fix any checksum mismatches or failed migrations
            flyway.repair();
            
            // Then run migrations
            flyway.migrate();
        };
    }
}

