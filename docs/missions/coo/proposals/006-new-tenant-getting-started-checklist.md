---
status: expired
attempts: 0
branch: null
---
# New Tenant "Getting Started" Checklist

## What you get
Right after a new salon owner signs up, the admin dashboard will tell them exactly what's left before customers can actually book an appointment — add your first service, add a staff member — with one-click links to do each. The checklist disappears on its own the moment both are done, so an owner who's already set up sees nothing extra.

## Why start this now
Signing up today creates a tenant, an admin login, and default business hours — but zero services and zero staff, because nothing seeds them. The admin dashboard's tile grid looks identical whether a salon is fully set up or brand new, so a first-time owner has no signal that their storefront's booking page is a dead end until a customer tries it and finds nothing to pick from. This is the exact moment a new signup either becomes an active salon or quietly churns before taking a single booking — and the fix is just surfacing data the app already has, not building anything new.

## Problem / opportunity
`TenantService.createTenant` (`apps/api/.../tenant/service/TenantService.java`) stamps a new `Tenant`, an `ADMIN` `User`, and a `BusinessSettings` row with default hours — but never creates a `ServiceType` or `Employee` row. Until the owner manually adds both from `/admin/services` and `/admin/staff`, `/booking` and `/services` have nothing to show a customer. Meanwhile `AdminPage.tsx` (`apps/web/.../pages/AdminPage.tsx`), the tile-grid admin home at `/admin/dashboard`, renders the exact same nine-tile grid and hardcoded "Quick Stats"/"Recent Activity" cards for every tenant regardless of whether it has any services or staff at all — there is no cue anywhere that tells a new owner what to do first. (Those Quick Stats/Recent Activity cards are already-known hardcoded placeholders unrelated to this proposal — out of scope here.)

## Proposed solution
`apps/web` only, no backend changes:
- Add `apps/web/src/components/GettingStartedChecklist.tsx`: on mount, calls the existing `apiService.getServices()` and `apiService.getEmployees()` (both already used elsewhere, e.g. `AdminServicesPage.tsx`). Computes two booleans: `hasActiveService` (at least one service with `active !== false`) and `hasEmployee` (at least one employee returned).
- Render it at the top of `AdminPage.tsx` (above the existing "Quick Stats" row), only when `hasActiveService && hasEmployee` is false. Two checklist rows, each with a check/empty icon, a short label, and a button linking to `/admin/services` ("Add your first service") and `/admin/staff` ("Add a staff member") respectively. A third, non-blocking row reminds the owner to review the default business hours at `/admin/settings` (hours are pre-filled with sensible defaults today, so this row is informational, never blocking).
- Once both `hasActiveService` and `hasEmployee` are true, the component renders nothing — no dismiss button or stored state needed, since the condition is simply no longer true.
- Loading state: render nothing while the two fetches are in flight (avoid a flash of the checklist before data arrives). Error state: if either fetch fails, fail silently and render nothing (never block the existing dashboard on this being unable to load).
- Match existing styling conventions (`Card`/`CardContent`, `dynamic-*` theme classes) already used throughout `AdminPage.tsx`.

## Effort estimate
S — one new small frontend component plus wiring it into one existing page, reusing two already-existing API client methods. No backend changes, no new dependencies, no new routes.

## Validation contract
- Functional assertions:
  - A newly signed-up tenant (0 services, 0 employees) visiting `/admin/dashboard` sees the checklist with both items unchecked, each linking to the right page.
  - After adding one active service, the "add a service" item is no longer required; after also adding one employee, the checklist disappears entirely.
  - A tenant that already has at least one active service and one employee never sees the checklist.
- Behavioral assertions:
  - The checklist never flashes visibly before the services/employees fetch resolves.
  - The rest of `AdminPage.tsx` (Quick Stats, Management Tools grid, Recent Activity) renders unchanged regardless of checklist state.
- Negative assertions (should NOT happen):
  - The checklist must never count another tenant's services or employees — it only ever calls the existing tenant-scoped `getServices()`/`getEmployees()` methods, introducing no new query paths.
  - A fetch failure for either call must never crash the admin dashboard or show an error state in place of the normal page.
  - An inactive-only service catalog (`active: false` for every row) must still count as "no service yet," not satisfy the checklist.
- Test commands the build will need to pass:
  - `apps/web`: `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build`

## Risks / open questions
- `/admin/dashboard` (`AdminPage.tsx`) may not be the first page every admin actually lands on after login (`/admin` renders a different component, `AdminDashboard.tsx`, a queue-management view) — worth confirming during the build which route is the true post-login landing page and placing the checklist there instead/also if it differs, so a new owner is guaranteed to see it on first login.
- "At least one employee" counts any employee row, not specifically one marked `available` — reasonable for v1 since a newly added employee defaults to unavailable until clocked in, and requiring "available" would never satisfy the checklist outside of business hours.
