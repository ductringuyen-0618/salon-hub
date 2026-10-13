---
status: proposed
attempts: 0
branch: null
---
# Admin Analytics & Reports Dashboard

## What you get
The Analytics & Reports tile in your admin dashboard — which today just says "coming soon" — becomes a real page: a 30-day revenue trend, your top 5 services by bookings and revenue, which hours of the day are busiest, and how many of your customers are repeat visitors versus first-timers. One screen that answers "is the business doing better than last month?" without opening a spreadsheet.

## Why start this now
Every number this page needs is already sitting in your database — every completed appointment already records its customer, services, price, employee, and time, because that's what booking and check-in already capture. Nothing new has to be tracked, no payment processor or outside service has to be integrated, and there's no dependency on either of the two in-flight problems (Admin Bookings is blocked only on a pre-existing test-suite conflict, not on missing data or UI). Right now the one place an owner would naturally go to see "how's business going" is a placeholder; the gap is in the two sentences this page already promises and has never delivered. Every week it stays a placeholder is a week of real bookings happening with nothing to show for them.

## Problem / opportunity
`apps/web/src/App.tsx`'s `/admin/analytics` route renders `AdminSectionPlaceholder` with the description "Revenue trends, busy-hour heatmaps, technician utilization, and customer retention" — a page that describes itself but shows nothing. Meanwhile `Appointment` (`apps/api/.../appointment/model/Appointment.java`) already has `status` (`BookingStatus.COMPLETED` etc.), `startTime`, a many-to-many `services` list (each `ServiceType` has a `price`), and an `employee`; `Customer` already has `createdAt`. All of it is tenant-scoped today via the existing Hibernate `@Filter`/`TenantFilter` mechanism every repository already relies on. There is simply no endpoint that aggregates this data, and no page that renders it.

## Proposed solution
`apps/api`:
- Add a read-only `AnalyticsController` (`/api/analytics/overview`, `GET`, `@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")`) returning a single DTO: daily revenue + completed-appointment counts for a date range (default last 30 days, via `?days=` param), top services by booking count and revenue, appointment counts by hour-of-day, and a new-vs-returning customer split (a customer is "returning" if they have more than one appointment with `startTime` before the query's end date).
- Implement the aggregation in a new `AnalyticsService`/`AnalyticsServiceImpl` using targeted repository queries against `AppointmentRepository` (new `@Query` methods filtered by `status = COMPLETED` and a date range) rather than loading every appointment into memory — the tenant filter already scopes every query, so no new tenant-isolation logic is needed.
- No schema changes, no new tables, no new dependency.

`apps/web`:
- Replace the `AdminSectionPlaceholder` on `/admin/analytics` with a new `AdminAnalyticsPage.tsx` that calls the new endpoint once on mount, and renders: a revenue-over-time chart, a top-services list, a busy-hours chart, and a new-vs-returning stat. Reuse whatever chart primitives already exist in the project (check `apps/web/src/components/ui` first) before adding a new charting dependency; if none exist, a small set of CSS/SVG bars is enough for this scope — do not add a new npm charting library for this.
- Loading state while the request is in flight, an empty state when a tenant has no completed appointments yet (new salon, nothing booked), and a visible error state if the request fails — no silent blank page.
- No changes to any other admin route.

## Effort estimate
M — one new read-only backend aggregation endpoint plus one new frontend page; no schema changes, no new dependencies, no new paid services. The main cost is the aggregation queries and the four small chart/stat views, not plumbing.

## Validation contract
- Functional assertions:
  - `GET /api/analytics/overview` returns daily revenue and completed-appointment counts covering the requested date range (default 30 days), top services ranked by booking count/revenue, appointment counts bucketed by hour-of-day, and a new-vs-returning customer count.
  - `/admin/analytics` renders those four views using real data from that endpoint, replacing the placeholder text.
  - The numbers reflect only `COMPLETED` appointments for revenue (not `CANCELLED` or still-`PENDING` ones).
- Behavioral assertions:
  - A tenant with zero completed appointments sees an empty state, not an error or a crash.
  - The endpoint is tenant-scoped the same way every other appointment query already is — a request only ever aggregates the requesting tenant's own data.
  - Only `MANAGER`/`ADMIN` roles can call the endpoint or see the page (same pattern `AppointmentController`/`ProtectedRoute` already use elsewhere).
- Negative assertions (should NOT happen):
  - The analytics endpoint must never return another tenant's appointments, customers, or revenue.
  - Cancelled or pending appointments must never be counted as revenue.
  - The page must never silently show a blank screen on a failed fetch.
- Test commands the build will need to pass:
  - `apps/api`: `./gradlew test --no-daemon`, `./gradlew integrationTest --no-daemon`, `./gradlew bootJar --no-daemon`
  - `apps/web`: `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build`

## Risks / open questions
- "Technician utilization" is named in the existing placeholder copy but is a meaningfully bigger feature (needs a notion of scheduled/working hours per employee, which doesn't exist yet) — this proposal deliberately scopes it out in favor of the four metrics above, which are fully supported by existing data; utilization can be a follow-up proposal if this one ships well.
- Proposal 003 (Admin Bookings) is `status: blocked` on an unrelated, pre-existing integration-test-suite conflict in `apps/api`; this proposal touches different controllers/services and should not depend on that being resolved, but the build should confirm `./gradlew integrationTest` isolation before assuming so.
- Hour-of-day bucketing should use the salon's own local time (the same assumption `AdminSettingsPage.tsx`'s `businessHours` already makes — single timezone per tenant), not UTC, to be meaningful to the owner reading it.
