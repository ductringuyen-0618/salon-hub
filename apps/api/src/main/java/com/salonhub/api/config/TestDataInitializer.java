package com.salonhub.api.config;

import com.salonhub.api.appointment.model.ServiceType;
import com.salonhub.api.appointment.repository.ServiceTypeRepository;
import com.salonhub.api.auth.model.User;
import com.salonhub.api.auth.repository.UserRepository;
import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.employee.model.Role;
import com.salonhub.api.employee.repository.EmployeeRepository;
import com.salonhub.api.tenant.TenantContext;
import com.salonhub.api.tenant.model.Tenant;
import com.salonhub.api.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Data initializer for all environments.
 * Creates default users for authentication and seeds service types when empty.
 *
 * Runs on startup. In production (Postgres + Flyway), Flyway already seeds
 * service_types via V4__seed_service_types.sql so this initializer's service
 * type block is a no-op. In H2 dev mode where Flyway is disabled, this
 * initializer seeds both users and service types from scratch.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TestDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Ensure the default tenant exists (Flyway V10 creates this in Postgres
        // but H2 dev mode uses Hibernate create-drop and skips Flyway, so we
        // seed it here too).
        seedDefaultTenant();
        // Scope all seed inserts to the default tenant. The TenantStampListener
        // picks this up from TenantContext and stamps tenant_id on each row.
        TenantContext.runAs(TenantContext.DEFAULT_ID, () -> {
            try {
                seedUsers();
                seedServiceTypes();
                seedEmployees();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    private void seedDefaultTenant() {
        if (tenantRepository.findById(TenantContext.DEFAULT_ID).isPresent()) return;
        Tenant t = new Tenant("default", "Default Salon");
        t.setId(TenantContext.DEFAULT_ID);
        tenantRepository.save(t);
        log.info("Seeded default tenant (id={}, slug=default)", TenantContext.DEFAULT_ID);
    }

    private void seedEmployees() {
        if (employeeRepository.count() > 0) {
            log.info("Employees already exist (count={}), skipping employee seed",
                    employeeRepository.count());
            return;
        }
        log.info("Seeding default employees for dev/E2E...");
        List<Employee> seeds = List.of(
                new Employee("Lisa Chen", Role.TECHNICIAN, true),
                new Employee("Maria Garcia", Role.TECHNICIAN, true),
                new Employee("Jenny Park", Role.TECHNICIAN, true),
                new Employee("Kim Nguyen", Role.TECHNICIAN, true),
                new Employee("Sarah Williams", Role.TECHNICIAN, true),
                new Employee("Alex Thompson", Role.FRONT_DESK, true),
                new Employee("Diana Mitchell", Role.MANAGER, true)
        );
        employeeRepository.saveAll(seeds);
        log.info("Seeded {} employees", seeds.size());
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Initializing test users for Swagger / E2E authentication...");

            createTestUser("admin@salonhub.com", "admin123", "Admin User", User.Role.ADMIN);
            createTestUser("manager@salonhub.com", "manager123", "Manager User", User.Role.MANAGER);
            createTestUser("frontdesk@salonhub.com", "frontdesk123", "Front Desk User", User.Role.FRONT_DESK);
            createTestUser("technician@salonhub.com", "technician123", "Technician User", User.Role.TECHNICIAN);
            createTestUser("customer@salonhub.com", "customer123", "Test Customer", User.Role.CUSTOMER);

            log.info("Test users created. Login credentials:");
            log.info("   Admin:      admin@salonhub.com / admin123");
            log.info("   Manager:    manager@salonhub.com / manager123");
            log.info("   Front Desk: frontdesk@salonhub.com / frontdesk123");
            log.info("   Technician: technician@salonhub.com / technician123");
            log.info("   Customer:   customer@salonhub.com / customer123");
        } else {
            log.info("Users already exist (count={}), skipping user seed", userRepository.count());
        }
    }

    private void seedServiceTypes() {
        if (serviceTypeRepository.count() > 0) {
            log.info("Service types already exist (count={}), skipping service-type seed",
                    serviceTypeRepository.count());
            return;
        }
        log.info("Seeding default service types for dev/E2E...");

        List<ServiceType> seeds = List.of(
                buildService("Signature Manicure", 60, "45.00", "Complete nail care with cuticle treatment, shaping, and luxury hand massage", "Manicure Services", true),
                buildService("Express Manicure", 30, "25.00", "Quick nail shaping, cuticle care, and polish application", "Manicure Services", false),
                buildService("Gel Manicure", 45, "35.00", "Long-lasting gel polish with chip-resistant finish", "Manicure Services", false),
                buildService("French Manicure", 50, "40.00", "Classic French tips with precision and elegance", "Manicure Services", false),
                buildService("Deluxe Pedicure", 75, "65.00", "Ultimate foot treatment with exfoliation, hot stone massage, and paraffin", "Pedicure Services", true),
                buildService("Classic Pedicure", 50, "45.00", "Traditional pedicure with cuticle care, callus treatment, and polish", "Pedicure Services", false),
                buildService("Gel Pedicure", 60, "55.00", "Long-lasting gel polish pedicure", "Pedicure Services", false),
                buildService("Acrylic Full Set", 90, "75.00", "Full set of acrylic nail extensions", "Nail Extensions", true),
                buildService("Acrylic Fill", 60, "45.00", "Acrylic nail maintenance and fill", "Nail Extensions", false),
                buildService("Dip Powder", 75, "55.00", "Dip powder nail application", "Nail Extensions", false),
                buildService("Nail Art (Simple)", 15, "10.00", "Simple nail art design per nail", "Add-Ons", false),
                buildService("Paraffin Treatment", 20, "15.00", "Soothing paraffin wax treatment", "Add-Ons", false)
        );

        serviceTypeRepository.saveAll(seeds);
        log.info("Seeded {} service types", seeds.size());
    }

    private ServiceType buildService(String name, int minutes, String price, String desc, String category, boolean popular) {
        ServiceType s = new ServiceType();
        s.setName(name);
        s.setEstimatedDurationMinutes(minutes);
        s.setPrice(new BigDecimal(price));
        s.setDescription(desc);
        s.setCategory(category);
        s.setPopular(popular);
        s.setActive(true);
        return s;
    }

    private void createTestUser(String email, String password, String name, User.Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .role(role)
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

            userRepository.save(user);
            log.debug("Created test user: {} with role: {}", email, role);
        }
    }
}
