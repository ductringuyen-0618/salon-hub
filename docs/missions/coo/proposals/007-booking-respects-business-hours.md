---
status: proposed
attempts: 0
branch: null
---
# Booking Respects Real Business Hours

## What you get
The online booking calendar will finally match the hours a salon actually sets. Customers will no longer be able to pick a date the salon is closed, or a time before opening or after closing — the calendar grays out closed days, and the time slots offered for any date only span that day's real open-to-close window.

## Why start this now
Every booking made through the site today ignores the salon's configured hours entirely: the calendar lets a customer pick any future date including days marked closed, and the time list is always a flat 9:00–19:00 no matter what day it is or what the owner configured in Admin Settings. That means a salon that's closed Sundays, or open 10–4 on Saturdays, can still receive online bookings at 9am on a Sunday — appointments that front-desk staff then have to catch and call to cancel, which is exactly the kind of avoidable friction and wasted staff time this product should prevent. The data needed to fix it already exists and is already public (`GET /api/settings`), so this is wiring, not new modeling.

## Problem / opportunity
`BusinessSettings.businessHours` (`apps/api/.../settings/model/BusinessSettings.java`) stores real per-weekday `{open, close, closed}` hours, served publicly and unauthenticated via `BusinessSettingsController.get()` at `GET /api/settings`, and the web client already has a typed method for it (`apiService.getSettings()` in `apps/web/src/services/api.ts`) — but `BookingPage.tsx` never calls it. Instead, the calendar's `disabled` prop (`apps/web/src/pages/BookingPage.tsx`, around the `CalendarComponent`) only blocks past dates, and the time grid comes from `generateTimeSlots()` (`apps/web/src/lib/bookingData.ts`), which hardcodes `startHour = 9, endHour = 19` for every single day of the week, with no awareness of closed days or shortened hours at all.

## Proposed solution
`apps/web` only, no backend changes (the endpoint already exists and is already public):
- In `BookingPage.tsx`, fetch `apiService.getSettings()` once (alongside the existing services/employees fetch) and keep the returned `businessHours` map in state.
- Pass a `disabled` predicate to `CalendarComponent` that also grays out any date whose weekday is marked `closed: true`, in addition to the existing past-date rule.
- Replace the hardcoded `generateTimeSlots(dateStr)` call with a version that takes that date's actual `open`/`close` strings from `businessHours` (falling back to the current 9–19 default only if settings fail to load or the weekday is missing from the map) and generates slots strictly within that window; a `closed` day yields an empty slot list with a clear "Closed this day" message instead of a stale/empty grid.
- No change to `generateTimeSlots`'s existing booked-slot/employee-conflict logic — only the hour bounds it's given change.

## Effort estimate
S — one existing, already-public endpoint and one existing client method just need to be called from a page that already fetches other data the same way; the change is confined to `BookingPage.tsx` and a small parameter addition to `generateTimeSlots` in `bookingData.ts`. No backend, schema, or dependency changes.

## Validation contract
- Functional assertions:
  - Selecting a date whose weekday is marked `closed: true` in the salon's business hours shows that date as disabled/unselectable on the calendar.
  - Selecting an open date shows only time slots between that weekday's configured `open` and `close` times, not the old fixed 9:00–19:00 range.
  - A salon with different hours on different weekdays (e.g. shorter Saturday hours) sees the slot range change correctly when the selected date's weekday changes.
- Behavioral assertions:
  - If `GET /api/settings` fails to load, the booking flow still works end to end using the previous fixed 9–19, every-day behavior as a fallback, rather than breaking the page.
  - Existing employee-availability conflict marking (busy slots shown as unavailable) continues to work unchanged within the new, narrower slot range.
  - The step's "Date &amp; Time" UI clearly communicates when a selected day is closed rather than silently showing zero slots.
- Negative assertions (should NOT happen):
  - A customer must never be able to submit a booking for a date/time outside the salon's configured open hours through this flow.
  - A customer must never be able to select and proceed past a date marked closed.
  - No tenant-crossing: the hours used must always be the current tenant's own `businessHours`, never another tenant's.
- Test commands the build will need to pass:
  - `apps/web`: `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build`

## Risks / open questions
- `businessHours` is keyed by lowercase weekday name per the model's own doc comment — need to confirm the exact key format (`"monday"` vs `"Monday"` vs `"mon"`) against real data/tests rather than assuming.
- This only guards the self-service booking UI; it does not add a backend-side rejection of out-of-hours appointments created via the staff-facing `AppointmentController`/`BookingController` paths, so a staff member could still manually book outside hours if that's ever a real need — deliberately left alone here as out of scope.
- Per-employee working hours/days (if any employee is scheduled narrower than the salon's overall hours) are not addressed by this proposal — it only fixes the salon-wide default, which is still strictly better than today's complete disregard for hours.
