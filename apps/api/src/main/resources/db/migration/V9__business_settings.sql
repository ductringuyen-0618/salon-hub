-- V9: Single-row business_settings table. All "knobs" the salon owner
-- wants to tweak from the admin console live here — name, hours, contact,
-- theme, operational params. Future multi-tenancy can add tenant_id later.
--
-- We seed one row so GET /api/settings always returns something even on a
-- brand-new install. The PUT endpoint updates this row in place.

CREATE TABLE business_settings (
    id BIGINT PRIMARY KEY,

    -- General
    business_name VARCHAR(120) NOT NULL DEFAULT 'SalonHub',
    tagline VARCHAR(240),

    -- Contact (rendered in the footer + booking confirmations)
    contact_phone VARCHAR(40),
    contact_email VARCHAR(120),
    contact_address VARCHAR(240),

    -- Per-day hours stored as JSON. Shape:
    --   {
    --     "monday":    {"open": "09:00", "close": "19:00", "closed": false},
    --     "tuesday":   {"open": "09:00", "close": "19:00", "closed": false},
    --     ... etc for all 7 weekday names lowercase ...
    --   }
    -- Frontend admin editor writes this; WaitTimeEstimator reads it.
    business_hours JSONB NOT NULL DEFAULT '{
        "monday":    {"open": "09:00", "close": "19:00", "closed": false},
        "tuesday":   {"open": "09:00", "close": "19:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "19:00", "closed": false},
        "thursday":  {"open": "09:00", "close": "19:00", "closed": false},
        "friday":    {"open": "09:00", "close": "19:00", "closed": false},
        "saturday":  {"open": "09:00", "close": "19:00", "closed": false},
        "sunday":    {"open": "10:00", "close": "17:00", "closed": false}
    }'::jsonb,

    -- Minutes of buffer between back-to-back walk-ins (tech station cleanup).
    turnover_minutes INTEGER NOT NULL DEFAULT 5,

    -- Tailwind dynamic-* variables get these hex values injected at runtime.
    theme_primary VARCHAR(20) NOT NULL DEFAULT '#d34000',
    theme_accent  VARCHAR(20) NOT NULL DEFAULT '#7c3aed',

    -- Optional URL to a logo image; admin can paste a URL (no file upload yet).
    logo_url VARCHAR(500),

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Single-row enforcement via a check constraint on the id column.
ALTER TABLE business_settings
    ADD CONSTRAINT business_settings_single_row CHECK (id = 1);

-- Seed the default row. Defaults are intentionally close to what the app
-- shipped with so existing pages don't suddenly look different post-migration.
INSERT INTO business_settings (id) VALUES (1);
