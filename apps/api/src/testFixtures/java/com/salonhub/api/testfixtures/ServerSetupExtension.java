package com.salonhub.api.testfixtures;

import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;


import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Bootstraps Spring Boot server for integration tests,
 * and ensures DatabaseSetupExtension runs.
 *
 * DatabaseSetupExtension wipes and reseeds the database fresh in every
 * class's beforeAll(), but every class using this annotation shares the
 * same Spring config, so Spring's test context cache would otherwise hand
 * every class after the first a *reused* ApplicationContext — skipping
 * TestDataInitializer (a CommandLineRunner, which only runs once per
 * context) even though the underlying DB was just wiped out from under
 * it. @DirtiesContext forces a fresh context, and therefore a fresh
 * TestDataInitializer run, for each class — matching what
 * DatabaseSetupExtension's per-class wipe already assumes.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@ExtendWith(DatabaseSetupExtension.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public @interface ServerSetupExtension {
}