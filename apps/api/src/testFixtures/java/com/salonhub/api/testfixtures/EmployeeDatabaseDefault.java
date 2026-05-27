package com.salonhub.api.testfixtures;

import org.springframework.jdbc.core.JdbcTemplate;
import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.employee.model.Role;
import java.util.List;
import java.util.stream.Collectors;

public class EmployeeDatabaseDefault {
    public static final Long ALICE_ID = 1L;
    public static final Employee ALICE = new Employee(ALICE_ID, "Alice Stylist", true,Role.TECHNICIAN);

    public static final Long BOB_ID = 2L;
    public static final Employee BOB = new Employee(BOB_ID, "Bob Manager", true, Role.TECHNICIAN);

    public static final List<Employee> EMPLOYEELIST = List.of(ALICE, BOB);

    public static final List<String> SQL = EMPLOYEELIST.stream()
        .map(e -> String.format(
            "INSERT INTO employees (id, name, available, role) VALUES (%d, '%s', %b, '%s');",
            e.getId(), e.getName(), e.isAvailable(), e.getRole().name()
        ))
        .collect(Collectors.toList());
    public static void seed(JdbcTemplate jdbc) {
            SQL.forEach(jdbc::execute);
        }
}
