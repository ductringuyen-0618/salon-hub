package com.salonhub.api.testfixtures;

import org.springframework.jdbc.core.JdbcTemplate;
import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.employee.model.Role;
import java.util.List;
import java.util.stream.Collectors;

public class EmployeeDatabaseDefault {
    /** All test fixtures live under the default tenant (id=1). */
    public static final Long TENANT_ID = 1L;

    public static final Long ALICE_ID = 1L;
    public static final Employee ALICE = build(ALICE_ID, "Alice Stylist", true, Role.TECHNICIAN);

    public static final Long BOB_ID = 2L;
    public static final Employee BOB = build(BOB_ID, "Bob Manager", true, Role.TECHNICIAN);

    public static final List<Employee> EMPLOYEELIST = List.of(ALICE, BOB);

    public static final List<String> SQL = EMPLOYEELIST.stream()
        .map(e -> String.format(
            "INSERT INTO employees (id, tenant_id, name, available, role) VALUES (%d, %d, '%s', %b, '%s');",
            e.getId(), TENANT_ID, e.getName(), e.isAvailable(), e.getRole().name()
        ))
        .collect(Collectors.toList());

    public static void seed(JdbcTemplate jdbc) {
        SQL.forEach(jdbc::execute);
    }

    private static Employee build(Long id, String name, boolean available, Role role) {
        Employee e = new Employee();
        e.setId(id);
        e.setTenantId(TENANT_ID);
        e.setName(name);
        e.setAvailable(available);
        e.setRole(role);
        return e;
    }
}
