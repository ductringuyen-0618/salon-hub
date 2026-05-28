package com.salonhub.api.tenant.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * A business that owns its own copy of customers, employees, services,
 * appointments, queue, settings. Identified externally by a URL-safe slug
 * (e.g. "lisa-salon" → lisa-salon.salon-hub.app).
 *
 * The seeded "default" tenant (id=1) owns all pre-V10 data so existing
 * deployments keep working unchanged.
 */
@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String slug;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Tenant(String slug, String name) {
        this.slug = slug;
        this.name = name;
        this.active = true;
    }
}
