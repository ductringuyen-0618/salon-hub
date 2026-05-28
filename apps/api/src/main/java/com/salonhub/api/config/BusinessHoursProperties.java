package com.salonhub.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

/**
 * Salon business-hours configuration. Consumed by WaitTimeEstimator to
 * clamp wait-time calculations to actual operating hours (so a 6pm walk-in
 * doesn't get quoted "30 minutes" when the salon closes at 7pm and there
 * are 5 people ahead of them — they'd get rolled to tomorrow morning).
 *
 * Overridable via env vars, e.g.:
 *   SALON_HUB_BUSINESS_OPEN=09:00
 *   SALON_HUB_BUSINESS_CLOSE=19:00
 *   SALON_HUB_BUSINESS_TURNOVER_MINUTES=10
 *   SALON_HUB_BUSINESS_CLOSED_DAYS=SUNDAY
 */
@ConfigurationProperties(prefix = "salon-hub.business")
public record BusinessHoursProperties(
        LocalTime open,
        LocalTime close,
        /** Minutes between back-to-back walk-ins for cleanup / turnover. */
        Integer turnoverMinutes,
        /** Days of week the salon is closed (no service done at all). */
        Set<DayOfWeek> closedDays
) {
    public LocalTime openOrDefault() {
        return open != null ? open : LocalTime.of(9, 0);
    }
    public LocalTime closeOrDefault() {
        return close != null ? close : LocalTime.of(19, 0);
    }
    public int turnoverOrDefault() {
        return turnoverMinutes != null ? Math.max(0, turnoverMinutes) : 5;
    }
    public Set<DayOfWeek> closedDaysOrDefault() {
        return closedDays != null ? closedDays : Set.of();
    }
}
