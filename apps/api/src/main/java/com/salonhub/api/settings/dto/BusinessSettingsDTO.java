package com.salonhub.api.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Public-facing settings shape. Used by both the GET endpoint (anonymous
 * customers fetch this on app boot) and the admin PUT endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessSettingsDTO {
    private String businessName;
    private String tagline;
    private String contactPhone;
    private String contactEmail;
    private String contactAddress;

    /** Keyed by lowercase weekday (monday..sunday). Each value:
     *  { open: "HH:mm", close: "HH:mm", closed: boolean } */
    private Map<String, DayHours> businessHours;

    private Integer turnoverMinutes;
    private String themePrimary;
    private String themeAccent;
    private String logoUrl;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayHours {
        private String open;   // "09:00"
        private String close;  // "19:00"
        private Boolean closed;
    }
}
