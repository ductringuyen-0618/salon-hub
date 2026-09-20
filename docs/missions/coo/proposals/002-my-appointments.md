---
status: expired
attempts: 0
branch: null
---
# My Appointments (customer self-service)

## What you get
Logged-in customers get a "My Appointments" page where they can see every booking they've made — past and upcoming — and cancel an upcoming one themselves, without calling or messaging the salon. Today a customer who books through the site has no way to look their booking back up or cancel it online; the only people who can do either are salon staff.

## Why start this now
Every booking made through the site today is a dead end for the customer the moment they close the confirmation screen — they cannot see it again or cancel it without contacting the salon directly, which is exactly the kind of friction that makes people call instead of self-serve, or just no-show instead of cancelling. The backend already tracks appointment status including `CANCELLED`, and a customer-list endpoint already exists (currently staff-only), so most of the hard modeling work is done — this is primarily wiring a self-service view and a narrow, ownership-checked cancel path on top of what's there. Every week it waits is more avoidable no-shows and more staff time spent on manual lookups and cancellations that the customer could have done themselves.

## Problem / opportunity
`apps/web` has no page for a logged-in customer to view or manage their own bookings — `AppointmentController` exposes `GET /api/appointments/customer/{customerId}` and `DELETE /api/appointments/{id}`, but both are locked to staff roles (`FRONT_DESK`/`MANAGER`/`ADMIN` for the list, `MANAGER`/`ADMIN` for cancel), and no page in `apps/web` calls either one. The web API client (`apps/web/src/services/api.ts`) already has unused typed methods for this (`getAppointmentsByCustomer`, `deleteAppointment`) — built once, never wired to a screen.

Ownership is not free, though: there is currently no link between a logged-in `User` account (`apps/api/.../auth/model/User.java`, role `CUSTOMER`) and a `Customer` record (`apps/api/.../customer/model/Customer.java`) — bookings are associated to a `Customer` purely by matching the email string typed into the booking form (`AppointmentServiceImpl.findOrCreateCustomer`), not by the authenticated user's identity. A "my appointments" feature has to establish that link by matching the authenticated user's email against `Customer.email`, since there is no shared id to rely on.

## Proposed solution
Backend (`apps/api`):
- Add a self-service endpoint, e.g. `GET /api/appointments/me`, restricted to `hasRole('CUSTOMER')`, that resolves the caller's `Customer` record by matching `authentication.principal.getUsername()` (the logged-in user's email) against `Customer.email`, then returns that customer's appointments (empty list if no matching `Customer` row exists yet — e.g. they registered but never booked).
- Add a narrow self-service cancel path, e.g. `DELETE /api/appointments/{id}/mine` (or extend the existing `DELETE /{id}` with an ownership-checked variant), restricted to `hasRole('CUSTOMER')`, that only succeeds if the appointment's `customer.email` matches the caller's email and the appointment isn't already `CANCELLED`/`COMPLETED`/in the past — otherwise 403/404/409 as appropriate. Reuse `AppointmentService.cancel` for the actual state change.
- Cover both with unit tests: happy path, wrong-owner rejection, already-cancelled/past-appointment rejection, no-matching-customer empty list.

Frontend (`apps/web`):
- Add `apps/web/src/pages/MyAppointmentsPage.tsx`, following the existing page patterns (`Navigation`, `Card`, `useToast`, loading/empty/error states like `AdminStaffPage.tsx`/`AdminServicesPage.tsx` use). Route it at `/my-appointments`, linked from account/nav for a logged-in `CUSTOMER`.
- List upcoming and past appointments (service, employee, date/time, status), fetched from the new `GET /api/appointments/me`. Empty state when the customer has no bookings yet, with a CTA to `/booking`.
- "Cancel" action on an upcoming, not-yet-cancelled appointment, with a confirm step, calling the new self-cancel endpoint and updating the list/toast on success or failure.
- Add the two new methods to `apps/web/src/services/api.ts` (`getMyAppointments`, `cancelMyAppointment`) following the existing method style; the pre-existing unused `getAppointmentsByCustomer`/`deleteAppointment` stay as-is (they back the staff-facing flow, not this one).

## Effort estimate
M — touches both apps: a new authorization-scoped backend endpoint pair plus ownership logic and tests, and a new frontend page plus nav wiring and two new client methods. No new infrastructure, dependencies, or paid services.

## Validation contract
- Functional assertions:
  - A logged-in `CUSTOMER` whose email matches an existing `Customer` record can load `/my-appointments` and see their own appointments (upcoming and past), and no one else's.
  - A logged-in `CUSTOMER` with no matching `Customer` record sees an empty state, not an error.
  - A logged-in `CUSTOMER` can cancel their own upcoming, not-yet-cancelled appointment from the page, and it now shows as cancelled.
- Behavioral assertions:
  - Cancelling shows a confirm step before the request fires; success and failure both show a toast.
  - The page shows a loading state while fetching and a clear error state if the fetch fails.
  - Staff roles are unaffected — existing staff-facing appointment endpoints and pages keep working exactly as before.
- Negative assertions (should NOT happen):
  - A `CUSTOMER` must never be able to view or cancel another customer's appointment (verified by an ownership-mismatch test returning 403/404, not the other customer's data).
  - A `CUSTOMER` must never be able to cancel an appointment that is already `CANCELLED`/`COMPLETED` or in the past via this endpoint.
  - No tenant-crossing: a customer in one tenant must never see or affect appointments belonging to another tenant.
- Test commands the build will need to pass:
  - `apps/web`: `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build`
  - `apps/api`: `./gradlew test --no-daemon`, `./gradlew integrationTest --no-daemon`, `./gradlew bootJar --no-daemon`

## Risks / open questions
- Matching ownership by email is workable but fragile long-term (email changes break the link, and a guest checkout under one email then a real account under a different email won't connect); a real `Customer.userId` link is a better fix but is a larger schema change out of scope here — this proposal deliberately uses the lighter email-match approach to stay small.
- Need to double check tenant scoping on the new endpoints the same way existing tenant-scoped queries do it, so this doesn't leak across tenants.
- Decide the cancellation cutoff (e.g. can't cancel within N hours of the appointment) — proposing no cutoff for v1 (any non-past, non-cancelled appointment can be self-cancelled) unless the build turns up an existing policy to match.
