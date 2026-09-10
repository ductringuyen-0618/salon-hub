---
status: proposed
attempts: 0
branch: null
---
# Staff Management admin page

## What you get
Salon owners get a real "Staff" screen in the admin area where they can see every stylist/technician on their team, add a new hire, edit someone's name and contact details, mark a staff member unavailable (e.g. on leave), and remove someone who has left — all without asking a developer to do it by hand. Today that admin tile just opens a "coming soon" page.

## Why start this now
Staff turnover is routine for a salon, and right now there is no self-serve way for an owner to add a new hire or take someone off the schedule — the tile on their own dashboard tells them it isn't built. The backend already has every endpoint this needs (list, get, create, update, delete, and an availability toggle), so this is almost entirely front-end work: low risk, quick to ship, and it removes one of the three remaining "not built yet" placeholders on the admin dashboard. Every day it waits is a day owners either can't onboard a new hire through the product or have to fall back to editing data directly.

## Problem / opportunity
`apps/web/src/pages/AdminSectionPlaceholder.tsx` is currently rendered at `/admin/staff`, telling the owner "this section is on the roadmap but not built yet." Meanwhile `apps/api`'s `EmployeeController` (`/api/employees`) already exposes full CRUD plus an availability toggle (`GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`, `GET /{id}/availability`, `PATCH /{id}/availability`), and the web app's `apiService` (`apps/web/src/services/api.ts`) already has typed client methods for all of it (`getEmployees`, `getEmployeeById`, `createEmployee`, `updateEmployee`, `deleteEmployee`, `updateEmployeeAvailability`). Nothing wires this together into a screen.

## Proposed solution
Add `apps/web/src/pages/AdminStaffPage.tsx`, following the existing `AdminServicesPage.tsx` pattern (same `Navigation`, `Card`, inline add/edit/delete affordances, `useToast` for feedback, loading state while fetching):
- List existing employees (name, role/title if the `Employee` type carries one, availability status) fetched via `apiService.getEmployees()`.
- "+ Add staff member" opens an inline form (name + contact fields per the `Employee` type) that calls `apiService.createEmployee`.
- Edit-in-place calls `apiService.updateEmployee`; delete (with a confirm step, matching the services page's pattern) calls `apiService.deleteEmployee`.
- An availability switch per row calls `apiService.updateEmployeeAvailability`.
- Empty state ("No staff yet — add your first team member") and an error toast on any failed request.
- Wire the route: in `apps/web/src/App.tsx`, replace the `AdminSectionPlaceholder` currently mounted at `/admin/staff` with `AdminStaffPage`.

No backend changes, no new dependencies, no new services/secrets. All requests go through the existing authenticated `apiService.request` helper, so tenant scoping follows whatever the existing employee endpoints already enforce — this proposal does not change tenant-isolation behavior, only surfaces it.

## Effort estimate
S — one new page component reusing an established pattern, one route change, zero backend or schema changes. A day or less.

## Validation contract
- Functional assertions:
  - `/admin/staff` renders `AdminStaffPage`, not the placeholder.
  - The page lists employees returned by `GET /api/employees` for the signed-in admin's tenant.
  - Adding, editing, deleting a staff member, and toggling availability each call the corresponding existing `apiService` method and refresh the list on success.
- Behavioral assertions:
  - Loading state shows while the initial fetch is in flight.
  - Empty state shows when the tenant has zero employees.
  - A failed create/update/delete/availability call shows an error toast and leaves the list unchanged (no optimistic entry left dangling).
- Negative assertions (should NOT happen):
  - No employee data from another tenant is ever fetched or rendered (the page must only call the existing tenant-scoped endpoints, never introduce a cross-tenant query).
  - No new backend endpoint, dependency, or environment variable is introduced.
  - The old `AdminSectionPlaceholder` route for `/admin/staff` is removed, not left reachable alongside the new page.
- Test commands the build will need to pass (from `.github/workflows/web-ci.yml`, run inside `apps/web`):
  - `npm ci`
  - `npm run lint`
  - `npm run test:ci`
  - `npm run build`

## Risks / open questions
- The `Employee` type in `apps/web/src/services/api.ts` needs checking for which contact/role fields it actually carries — the add/edit form should only expose fields the backend model supports, not invent new ones.
- If `DELETE /api/employees/{id}` conflicts (e.g. an employee with future appointments), the page should surface the server's error message rather than assume delete always succeeds — needs confirming against the controller's actual error behavior during implementation.
- No frontend tests currently cover admin pages (per the existing `AdminServicesPage.tsx` having none); this proposal doesn't introduce a new testing pattern, just follows the repo's current bar.
