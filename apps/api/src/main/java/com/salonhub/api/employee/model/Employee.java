package com.salonhub.api.employee.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "employees")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** True if the employee is currently clocked in/able to take appointments */
    @Column(nullable = false)
    private boolean available = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public Employee(String name, Role role) {
        this.name = name;
        this.role = role;
        this.available = false;
    }

    public Employee(String name, Role role, boolean available) {
        this.name = name;
        this.available = available;
        this.role = role;
    }
}