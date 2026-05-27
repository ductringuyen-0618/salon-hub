package com.salonhub.api.testfixtures;

import org.springframework.jdbc.core.JdbcTemplate;
import com.salonhub.api.customer.model.Customer;
import java.util.List;
import java.util.stream.Collectors;

public class CustomerDatabaseDefault {
    public static final Long JANE_ID = 1L;
    // Added phone number field
    public static final Customer JANE = new Customer(JANE_ID, "Jane Doe", "jane@example.com", "555-0101");

    public static final Long JOHN_ID = 2L;
    public static final Customer JOHN = new Customer(JOHN_ID, "John Smith", "john@salon.com", "555-0202");

    public static final List<Customer> CUSTOMERLIST = List.of(JANE, JOHN);

    public static final List<String> SQL = CUSTOMERLIST.stream()
        .map(c -> String.format(
            "INSERT INTO customers (id, name, email, phone_number) VALUES (%d, '%s', '%s', '%s');",
            c.getId(), c.getName(), c.getEmail(), c.getPhoneNumber()
        ))
        .collect(Collectors.toList());
    public static void seed(JdbcTemplate jdbc) {
            SQL.forEach(jdbc::execute);
        }
}