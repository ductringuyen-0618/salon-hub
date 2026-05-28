package com.salonhub.api.settings.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Single-row table holding every "operator-tweakable" knob for the salon.
 * The admin console edits this; the public storefront + the wait-time
 * scheduler read from it.
 *
 * Hours are stored as a JSONB blob keyed by weekday name (lowercase), each
 * value being {"open": "HH:mm", "close": "HH:mm", "closed": boolean}. We
 * deserialize to Map<String, Map<String, Object>> here and convert to typed
 * DTOs in the service layer — keeps the persistence model dumb.
 */
@Entity
@Table(name = "business_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessSettings {

    @Id
    private Long id;

    @Column(name = "business_name", nullable = false, length = 120)
    private String businessName;

    @Column(length = 240)
    private String tagline;

    @Column(name = "contact_phone", length = 40)
    private String contactPhone;

    @Column(name = "contact_email", length = 120)
    private String contactEmail;

    @Column(name = "contact_address", length = 240)
    private String contactAddress;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "business_hours", nullable = false, columnDefinition = "jsonb")
    private Map<String, Map<String, Object>> businessHours;

    @Column(name = "turnover_minutes", nullable = false)
    private Integer turnoverMinutes;

    @Column(name = "theme_primary", nullable = false, length = 20)
    private String themePrimary;

    @Column(name = "theme_accent", nullable = false, length = 20)
    private String themeAccent;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
