---
status: proposed
attempts: 0
branch: null
---
# Real Storefront Homepage

## What you get
The homepage every visitor lands on first will finally show your salon's real phone number, email, address, and today's actual open/closed status and hours — the same details you already type into Admin → Settings. The "popular services" preview on that page will show your real services and real prices instead of a generic placeholder list that has nothing to do with your menu.

## Why start this now
You can already edit your business hours, contact details, and services in the admin console, and that data is already flowing into the website's frontend — it's just never displayed anywhere a visitor can see it. Today the homepage shows a hardcoded phone-free hero with invented services like "Signature Manicure — $45," which may not match what you actually charge, and gives a first-time visitor no way to find your address, hours, or phone number without clicking through to book. That's a trust problem on the single page that gets the most traffic, and it costs nothing new to fix: the wiring on the backend and the admin UI is already done, this is purely about putting real data in front of customers instead of placeholder copy. Every day it stays as-is, the homepage keeps contradicting the real menu one click away.

## Problem / opportunity
`apps/web/src/components/HomePage.tsx` only reads `settings.businessName` and `settings.tagline` from `useSettings()` (`apps/web/src/contexts/SettingsContext.tsx`), even though that same context already exposes `contactPhone`, `contactEmail`, `contactAddress`, and `businessHours` (all backed by `BusinessSettings` on the API, editable today via `AdminSettingsPage.tsx`). The homepage's "services" section is a hardcoded local array with fixed names/prices/descriptions, while `ServicesPage.tsx` already fetches the real list from `apiService.getServices()`. The result: a salon owner can fully configure their real hours, contact info, and services, and none of it reaches the one page customers see first.

## Proposed solution
`apps/web`:
- In `HomePage.tsx`, add a contact/hours section that reads `contactPhone`, `contactEmail`, `contactAddress`, and `businessHours` from `useSettings()`. Show a click-to-call `tel:` link for the phone, a `mailto:` link for the email, the address as plain text, and today's open/closed state plus the full week's hours (reuse the same day-key/label mapping `AdminSettingsPage.tsx` already defines for `businessHours`, e.g. extract `DAYS`/`DayHours` formatting into a small shared helper rather than duplicating it).
- Replace the hardcoded `services` array in `HomePage.tsx` with a fetch of real active services via `apiService.getServices()` (same call `ServicesPage.tsx` already makes), showing up to a handful of them (e.g. first 4 active services) with their real name, price, and duration. Keep the existing card layout/styling.
- Handle missing data gracefully: when a contact field is null/empty, omit that row instead of showing "null" or an empty link; when services fail to load or none are active, keep the section hidden or show a simple "see all services" link rather than an error.
- Leave the aspirational marketing stats ("2,500+ happy clients", "4.9 rating") as-is — out of scope, since there's no backing data field for them and changing marketing copy isn't the problem being solved here.
- No backend changes needed: `/api/settings` and `/api/services` already exist and are already called elsewhere in the app.

## Effort estimate
S — frontend-only change to one page plus a small shared hours-formatting helper; no new backend endpoints, no new dependencies, no schema changes. The data is already fetched into the app today.

## Validation contract
- Functional assertions:
  - The homepage shows the tenant's `contactPhone`, `contactEmail`, and `contactAddress` when set, each omitted individually when null/empty.
  - The homepage shows today's open/closed status and the full week's hours, matching the values configured in Admin → Settings' `businessHours`.
  - The homepage's services preview shows real active services (name, price, duration) fetched from the services API, not the previous hardcoded array.
- Behavioral assertions:
  - If `/api/settings` or `/api/services` fails or returns empty/default data, the homepage still renders without crashing (graceful fallback/hidden section, no uncaught error).
  - Hours/contact info reflects the same values the admin just saved in `AdminSettingsPage.tsx` after a reload (this already works via `SettingsProvider.reload()`; this proposal only adds a consumer, not new fetch/reload logic).
- Negative assertions (should NOT happen):
  - The homepage must never render the string "null"/"undefined" for an unset contact field.
  - The homepage must never show another tenant's contact info or services (relies on the existing tenant-scoped `/api/settings` and `/api/services` responses; this proposal does not change tenant-scoping logic).
  - The hardcoded placeholder services array must no longer be shown once real services are available.
- Test commands the build will need to pass:
  - `apps/web`: `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build`

## Risks / open questions
- `businessHours` values are free-form strings edited by the owner; the "open now" computation needs to handle a closed day, a missing day entry, and plain string compare of "HH:mm" against the current local time without over-engineering timezone handling (the business and its customers are assumed to share a timezone, consistent with how `AdminSettingsPage.tsx` already treats hours).
- Only a handful of services should show on the homepage preview (not the full catalog) — proposing "first 4 active services" as a simple default unless the build turns up an existing "featured" concept to prefer instead.
