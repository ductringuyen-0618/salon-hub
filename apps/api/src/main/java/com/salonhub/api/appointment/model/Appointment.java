package com.salonhub.api.appointment.model;

import jakarta.persistence.EnumType;
import com.salonhub.api.customer.model.Customer;
import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.tenant.TenantFilter;
import com.salonhub.api.tenant.TenantStampListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Filter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "appointments")
@Filter(name = TenantFilter.NAME, condition = "tenant_id = :tenantId")
@EntityListeners(TenantStampListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToMany
    @JoinTable(
        name = "appointment_services",
        joinColumns = @JoinColumn(name = "appointment_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private List<ServiceType> services;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;
}