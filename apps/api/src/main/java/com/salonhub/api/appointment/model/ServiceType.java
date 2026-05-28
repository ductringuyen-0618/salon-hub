package com.salonhub.api.appointment.model;

import com.salonhub.api.tenant.TenantFilter;
import com.salonhub.api.tenant.TenantStampListener;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

@Entity
@Table(name = "service_types")
@Filter(name = TenantFilter.NAME, condition = "tenant_id = :tenantId")
@EntityListeners(TenantStampListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false)
    private String name;

    @Column(name = "estimated_duration_minutes", nullable = false)
    private Integer estimatedDurationMinutes;

    @Column(nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal price;

    @Column(length = 500)
    private String description;

    @Column(length = 100)
    private String category;

    @Column(nullable = false)
    private Boolean popular = false;

    @Column(nullable = false)
    private Boolean active = true;

    // Constructor for backward compatibility (without new fields)
    public ServiceType(Long id, String name, Integer estimatedDurationMinutes, java.math.BigDecimal price) {
        this.id = id;
        this.name = name;
        this.estimatedDurationMinutes = estimatedDurationMinutes;
        this.price = price;
        this.popular = false;
        this.active = true;
    }
}
