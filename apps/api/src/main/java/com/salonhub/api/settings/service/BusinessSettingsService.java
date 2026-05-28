package com.salonhub.api.settings.service;

import com.salonhub.api.settings.dto.BusinessSettingsDTO;
import com.salonhub.api.settings.model.BusinessSettings;
import com.salonhub.api.settings.repository.BusinessSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Reads + writes the singleton BusinessSettings row.
 *
 * The wait-time scheduler and the public storefront both hit getCurrent()
 * on every request, so it's worth caching. We bust the cache on every
 * update so admins see their changes reflected immediately.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BusinessSettingsService {

    private final BusinessSettingsRepository repository;

    /** In-memory cache. Cleared by update(). Initialized on first read. */
    private volatile BusinessSettings cached;

    public BusinessSettings getCurrent() {
        BusinessSettings local = cached;
        if (local != null) return local;
        synchronized (this) {
            if (cached != null) return cached;
            cached = repository.findById(BusinessSettingsRepository.SINGLETON_ID)
                    .orElseGet(this::createDefault);
            return cached;
        }
    }

    /** Convenience for callers that don't need the entity. */
    public BusinessSettingsDTO getCurrentAsDto() {
        return toDto(getCurrent());
    }

    @Transactional
    public BusinessSettings update(BusinessSettingsDTO dto) {
        BusinessSettings current = getCurrent();
        applyDto(current, dto);
        BusinessSettings saved = repository.save(current);
        // Bust cache so subsequent reads see the new values.
        cached = null;
        return saved;
    }

    /* ---------- helpers ---------- */

    private BusinessSettings createDefault() {
        BusinessSettings s = new BusinessSettings();
        s.setId(BusinessSettingsRepository.SINGLETON_ID);
        s.setBusinessName("SalonHub");
        s.setTagline(null);
        s.setBusinessHours(defaultHoursMap());
        s.setTurnoverMinutes(5);
        s.setThemePrimary("#d34000");
        s.setThemeAccent("#7c3aed");
        return repository.save(s);
    }

    private static Map<String, Map<String, Object>> defaultHoursMap() {
        Map<String, Map<String, Object>> all = new LinkedHashMap<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            Map<String, Object> entry = new HashMap<>();
            // Sunday gets shorter default hours (10am-5pm); everyone else 9am-7pm.
            entry.put("open",   day == DayOfWeek.SUNDAY ? "10:00" : "09:00");
            entry.put("close",  day == DayOfWeek.SUNDAY ? "17:00" : "19:00");
            entry.put("closed", Boolean.FALSE);
            all.put(day.name().toLowerCase(), entry);
        }
        return all;
    }

    public static BusinessSettingsDTO toDto(BusinessSettings s) {
        BusinessSettingsDTO dto = new BusinessSettingsDTO();
        dto.setBusinessName(s.getBusinessName());
        dto.setTagline(s.getTagline());
        dto.setContactPhone(s.getContactPhone());
        dto.setContactEmail(s.getContactEmail());
        dto.setContactAddress(s.getContactAddress());
        dto.setTurnoverMinutes(s.getTurnoverMinutes());
        dto.setThemePrimary(s.getThemePrimary());
        dto.setThemeAccent(s.getThemeAccent());
        dto.setLogoUrl(s.getLogoUrl());
        dto.setBusinessHours(convertHoursToDto(s.getBusinessHours()));
        return dto;
    }

    private static Map<String, BusinessSettingsDTO.DayHours> convertHoursToDto(
            Map<String, Map<String, Object>> raw) {
        Map<String, BusinessSettingsDTO.DayHours> out = new LinkedHashMap<>();
        if (raw == null) return out;
        for (Map.Entry<String, Map<String, Object>> e : raw.entrySet()) {
            Map<String, Object> v = e.getValue();
            BusinessSettingsDTO.DayHours dh = new BusinessSettingsDTO.DayHours();
            dh.setOpen(asString(v.get("open")));
            dh.setClose(asString(v.get("close")));
            dh.setClosed(asBool(v.get("closed")));
            out.put(e.getKey(), dh);
        }
        return out;
    }

    private static void applyDto(BusinessSettings s, BusinessSettingsDTO dto) {
        if (dto.getBusinessName() != null) s.setBusinessName(dto.getBusinessName());
        if (dto.getTagline() != null) s.setTagline(dto.getTagline());
        if (dto.getContactPhone() != null) s.setContactPhone(dto.getContactPhone());
        if (dto.getContactEmail() != null) s.setContactEmail(dto.getContactEmail());
        if (dto.getContactAddress() != null) s.setContactAddress(dto.getContactAddress());
        if (dto.getTurnoverMinutes() != null) s.setTurnoverMinutes(dto.getTurnoverMinutes());
        if (dto.getThemePrimary() != null) s.setThemePrimary(dto.getThemePrimary());
        if (dto.getThemeAccent() != null) s.setThemeAccent(dto.getThemeAccent());
        if (dto.getLogoUrl() != null) s.setLogoUrl(dto.getLogoUrl());
        if (dto.getBusinessHours() != null) {
            Map<String, Map<String, Object>> raw = new LinkedHashMap<>();
            for (Map.Entry<String, BusinessSettingsDTO.DayHours> e : dto.getBusinessHours().entrySet()) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("open", e.getValue().getOpen());
                entry.put("close", e.getValue().getClose());
                entry.put("closed", e.getValue().getClosed() != null && e.getValue().getClosed());
                raw.put(e.getKey().toLowerCase(), entry);
            }
            s.setBusinessHours(raw);
        }
    }

    /* ---------- helpers used by WaitTimeEstimator ---------- */

    /**
     * Returns parsed hours for a specific weekday, or null if the salon is
     * closed that day.
     */
    public DayHoursParsed getHoursFor(DayOfWeek day) {
        BusinessSettings s = getCurrent();
        Map<String, Object> raw = s.getBusinessHours() == null ? null
                : s.getBusinessHours().get(day.name().toLowerCase());
        if (raw == null) return null;
        boolean closed = asBool(raw.get("closed"));
        if (closed) return null;
        try {
            LocalTime open = LocalTime.parse(asString(raw.get("open")));
            LocalTime close = LocalTime.parse(asString(raw.get("close")));
            return new DayHoursParsed(open, close);
        } catch (Exception e) {
            log.warn("Invalid hours config for {}: {}", day, raw);
            return null;
        }
    }

    public int getTurnoverMinutes() {
        Integer m = getCurrent().getTurnoverMinutes();
        return m != null && m > 0 ? m : 5;
    }

    public record DayHoursParsed(LocalTime open, LocalTime close) {}

    private static String asString(Object o) { return o == null ? null : o.toString(); }
    private static boolean asBool(Object o) {
        if (o == null) return false;
        if (o instanceof Boolean b) return b;
        return Boolean.parseBoolean(o.toString());
    }
}
