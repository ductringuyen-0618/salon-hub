---
status: in_progress
attempts: 2
branch: coo/admin-bookings
---
# Admin Bookings (staff schedule & management page)

## What you get
Front-desk staff, managers and owners get a real "Bookings" page: one place to see every appointment on the books — today's schedule plus everything upcoming and past — and to confirm, reschedule-by-status, or cancel any of them right from the list. Right now the "Booking Management" tile on the admin dashboard is a dead link that just bounces back to the dashboard, so staff still track the day's schedule by other means.

## Why start this now
The admin dashboard already advertises this: it has a "Booking Management — View and manage appointments" tile pointing at `/admin/bookings`, and clicking it does nothing useful today (it redirects straight back to the dashboard) — that's a visibly broken promise to the very users (front desk, managers) who log in every day to run the schedule. All the underlying pieces already exist and work (appointment status updates, cancel, tenant scoping) — nothing is being built from scratch, this is closing the one missing piece (an all-appointments list) and giving staff a page to use it from. Every day it stays a dead tile is another day staff manage the day's bookings without the tool the product already claims to offer.

## Problem / opportunity
`apps/web/src/pages/AdminPage.tsx` renders a "Booking Management" tile linking to `/admin/bookings`, but in `apps/web/src/App.tsx` that route is `<Navigate to="/admin" replace />` — a placeholder, not a page. Staff have no screen to see all appointments at once: `AppointmentController` only exposes lookups scoped to one customer (`GET /api/appointments/customer/{id}`) or one employee (`GET /api/appointments/employee/{id}`), and `AppointmentRepository` has no `findAll`-style query beyond what `JpaRepository` gives for free. Status updates (`PATCH /api/appointments/{id}/status`) and cancellation (`DELETE /api/appointments/{id}`) are already implemented and already restricted to `FRONT_DESK`/`MANAGER`/`ADMIN`, but nothing in the frontend calls them outside the booking-creation flow.

## Proposed solution
Backend (`apps/api`):
- Add `GET /api/appointments`, restricted to `hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')`, returning all appointments for the current tenant (the existing `@Filter(tenant_id = :tenantId)` on `Appointment` already scopes `JpaRepository.findAll()` the same way other tenant-scoped list endpoints rely on it — no new tenant-filtering logic needed). Support optional `from`/`to` `LocalDate` query params to narrow the range (default: no filter, return everything) so the page can ask for "today" without pulling full history every load.
- Add the corresponding repository query (`findByStartTimeBetween`, alongside the existing `findByCustomerId`/`findByEmployeeIdAndStartTimeBetween`) and a `listAll(from, to)` method on `AppointmentService`/`AppointmentServiceImpl`.
- Unit tests: returns only the current tenant's appointments, respects `from`/`to` when given, empty list when there are none, role check rejects `TECHNICIAN`/`CUSTOMER`.

Frontend (`apps/web`):
- Add `apps/web/src/pages/AdminBookingsPage.tsx`, following the `AdminServicesPage.tsx`/`AdminStaffPage.tsx` conventions (`Navigation`, `Card`, `useToast`, loading/empty/error states).
- Default view: today's appointments (customer, service(s), employee, time, status), with a way to page back/forward by day or switch to "all upcoming". Each row gets a status action (e.g. mark completed / no-show) and a cancel action with a confirm step, calling the existing `updateAppointmentStatus`/`deleteAppointment` methods already in `apps/web/src/services/api.ts`.
- Add one new client method, `getAppointments(from?, to?)`, calling the new endpoint, following the existing method style in `api.ts`.
- Wire the route: replace the `/admin/bookings` placeholder redirect in `App.tsx` with `<AdminBookingsPage />`.

## Effort estimate
M — one new read endpoint plus a small repository/service addition and tests on the backend; one new admin page reusing existing status/cancel client methods and UI patterns on the frontend. No new dependencies, no schema changes, no paid services.

## Validation contract
- Functional assertions:
  - A logged-in `FRONT_DESK`/`MANAGER`/`ADMIN` user can open `/admin/bookings` and see every appointment for their own tenant, not appointments belonging to other tenants.
  - `from`/`to` query params on `GET /api/appointments` narrow the result to that range; omitting them returns everything for the tenant.
  - Staff can change an appointment's status and cancel an appointment from the page, and the list reflects the change without a full page reload.
- Behavioral assertions:
  - The page shows a loading state while fetching and a clear error state if the fetch fails.
  - Empty state ("No appointments for this day/range") is distinct from the error state.
  - Cancelling shows a confirm step before the request fires; status changes and cancellation both show a success or failure toast.
- Negative assertions (should NOT happen):
  - `TECHNICIAN` and `CUSTOMER` roles must never be able to call `GET /api/appointments` (403).
  - No tenant-crossing: an appointment belonging to another tenant must never appear in the list or be modifiable through this page's actions.
  - The old placeholder redirect must not still be reachable at `/admin/bookings` after this ships.
- Test commands the build will need to pass:
  - `apps/web`: `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build`
  - `apps/api`: `./gradlew test --no-daemon`, `./gradlew integrationTest --no-daemon`, `./gradlew bootJar --no-daemon`

## Risks / open questions
- Returning literally every appointment with no default range could get slow for a long-lived salon; defaulting the page's initial load to "today" (using the new `from`/`to` params) avoids this without needing pagination for v1.
- Decide how granular status actions should be in the UI (e.g. expose every `BookingStatus` value vs. just "complete"/"no-show"/"cancel"); proposing the small, common set for v1 and leaving full status editing to the existing `PUT /{id}` update flow if staff need it.
- `/admin/staff` is mid-flight on another branch (`coo/staff-management`, PR #4, not yet merged); this proposal only touches `/admin/bookings` and shares no files with that work, so there's no merge conflict risk.

## Attempt 1 notes
Built and pushed (branch `coo/admin-bookings`, PR #7). Web CI (`web-ci.yml`) is green. API CI (`api-ci.yml`, job `build-test`) is red, but **not because of this change**: `111 tests completed, 42 failed`, entirely in classes this PR doesn't touch (`ServiceTypeControllerTest`, `QueueControllerTest`, `QueueServiceImplTest`, `SecuritySystemTest`, `SimpleAuthTest`, `CheckInServiceTest`), plus 3 of my own new `AppointmentControllerTest` cases failing the same way as the 2 pre-existing ones in that file. Root cause: every `@WebMvcTest`/`@SpringBootTest` class fails with `NoSuchBeanDefinitionException: UserRepository` while instantiating `SupabaseJwtAuthenticationFilter` — its `@ConditionalOnProperty(name = "supabase.jwks-url")` appears to match the literal string `"#{null}"` (the `${SUPABASE_JWKS_URL:#{null}}` YAML default isn't SpEL-evaluated outside `@Value`), so the filter always activates and can't autowire `UserRepository` in sliced test contexts.

Confirmed pre-existing via `git stash` (unmodified `main` produces the identical failure) and via a from-scratch local run against real Postgres 16 (not just CI's container) — byte-for-byte the same 42 failures. Commit `53e8244a` already documented "CI has been red since May for both Web CI and API CI... apps/api is left untouched"; Actions history confirms API CI hasn't passed since May 28. Separately found (also pre-existing, also unrelated): the custom `integrationTest` Gradle task is missing `useJUnitPlatform()` and silently runs 0 tests.

Posted a standing-down comment on PR #7 (https://github.com/ductringuyen-0618/salon-hub/pull/7#issuecomment-5858644150) rather than attempting a fix — it's shared auth/build infrastructure, unrelated to appointments, and deserves its own reviewed proposal. This proposal stays `in_progress`, not `shipped`, until API CI is actually green (either that infra issue gets fixed upstream, or someone decides otherwise).

## Attempt 2 notes
Went back in on the pre-existing API CI failure from Attempt 1 rather than leaving it for a separate proposal — it turned out to be small and well-scoped enough to fix directly. Root cause chain (each layer only became visible once the layer below it was fixed):

1. `supabase.jwks-url` / `supabase.secret-key` used a `${VAR:#{null}}` YAML default. That idiom is only SpEL-evaluated inside `@Value`, not for plain property lookups, so `@ConditionalOnProperty` (gating `SupabaseJwtAuthenticationFilter`, which needs `UserRepository`) saw the literal string `"#{null}"` — present and non-`"false"` — so the filter was always active regardless of env vars. This broke every `@WebMvcTest`/`@SpringBootTest` class.
2. The Gradle `integrationTest` task was missing `useJUnitPlatform()`, so it silently ran 0 tests.
3. Fixing #1 surfaced the identical bug one layer up: `spring.security.oauth2.resourceserver.jwt.jwk-set-uri`/`issuer-uri` had the same `#{null}` default, so OAuth2 resource server auto-config tried building a `NimbusJwtDecoder` from the literal string `"#{null}"` → `MalformedURLException`.
4. That surfaced `TenantResolutionFilter` (a plain `Filter` bean, always included by `@WebMvcTest` slices) failing to construct — its `TenantService`/`TenantSessionConfigurer` deps aren't available in a slice context. Fixed centrally by mocking both in `TestSecurityConfig`.
5. That surfaced a **real production bug**: `GlobalExceptionHandler` had no handler for `AccessDeniedException`/`AuthorizationDeniedException`, so every `@PreAuthorize` denial fell through to the catch-all and returned 500 instead of 403 — for every role-protected endpoint in the app, not just appointments. Caught by this PR's own new 403 test cases, the first in the suite to exercise this path end-to-end.

Result: `./gradlew test` failures went from 42 → 15 (confirmed on CI run https://github.com/ductringuyen-0618/salon-hub/actions/runs/37144617943, head `0a61def3`). All appointment/tenant/auth-related tests, including this PR's own, are green. The remaining 15 are two unrelated, pre-existing failures that don't touch any file this PR changes:
- `SimpleAuthTest` + `SecuritySystemTest` (7 tests) — share one Spring context cache key; the real failure is `SimpleAuthTest`'s `StaleObjectStateException` merging `Tenant#1`, a seed-data/tenant-bootstrap mismatch when that test's `@TestPropertySource` disables Flyway.
- `QueueServiceImplTest` + `CheckInServiceTest` (8 tests) — plain Mockito unit tests whose mocks/expectations have drifted from `QueueServiceImpl`/`CheckInService`'s current behavior (e.g. `WaitTimeEstimator` never mocked) — unrelated Queue/Check-In business-logic drift.

Could not verify `./gradlew integrationTest` locally (no Docker daemon in the sandbox); it compiles cleanly and ran for real on the CI runner. `./gradlew bootJar` succeeds locally.

Standing down on the remaining 15 (comment https://github.com/ductringuyen-0618/salon-hub/pull/7#issuecomment-5972235349) rather than spending a third attempt on them — fixing them means understanding the tenant-seeding bootstrap path and the Queue/Check-In business logic, which is genuinely out of scope for "Admin Bookings." This proposal stays `in_progress`, not `shipped`, until `build-test` is fully green.
