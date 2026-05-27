package com.salonhub.api.testfixtures;

import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;


import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Bootstraps Spring Boot server for integration tests,
 * and ensures DatabaseSetupExtension runs.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@ExtendWith(DatabaseSetupExtension.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public @interface ServerSetupExtension {
}