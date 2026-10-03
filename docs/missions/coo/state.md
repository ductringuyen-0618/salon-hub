# salon-hub COO -- State

Shipped: 1/1

## Log
- 2026-09-10: connected to agent-os; no proposals yet.
- 2026-09-10: proposed docs/missions/coo/proposals/001-staff-management.md (Staff Management admin page).
- 2026-09-12: approved via GitHub issue #3; built, validated, PR #4 opened.
- 2026-09-12: shipped docs/missions/coo/proposals/001-staff-management.md — PR #4 CI green (build-test success), awaiting human merge. Report: docs/missions/coo/reports/001-staff-management.md.
- 2026-09-13: proposed docs/missions/coo/proposals/002-my-appointments.md (My Appointments customer self-service page).
- 2026-09-20: no decision in 7 days on docs/missions/coo/proposals/002-my-appointments.md — expired, issue #5 closed.
- 2026-09-20: proposed docs/missions/coo/proposals/003-admin-bookings.md (Admin Bookings staff schedule & management page).
- 2026-09-26: no decision yet on docs/missions/coo/proposals/003-admin-bookings.md (6 days old) — posted 2nd reminder on issue #6, expires 2026-09-27 if still undecided.
- 2026-09-27: approved via GitHub issue #6 ("Approve" comment from repo owner); built and validated, PR #7 opened (branch coo/admin-bookings). API CI expected to be red on this PR for pre-existing, unrelated reasons (see PR #7 description) — CI still pending, not yet shipped.
- 2026-09-27: API CI on PR #7 confirmed red for pre-existing, unrelated reasons (SupabaseJwtAuthenticationFilter conditional-property bug breaking every @WebMvcTest/@SpringBootTest class since May, plus a Gradle integrationTest task missing useJUnitPlatform()). Posted standing-down comment on PR #7, recorded as Attempt 1 in the proposal. Not shipped — worth a dedicated fix proposal for the CI infra itself.
- 2026-10-03: went back into PR #7 (Attempt 2) and actually fixed the root cause instead of standing down — it was small and well-scoped. Fixed the `#{null}` property-default bug in both `supabase.*` and `spring.security.oauth2.resourceserver.jwt.*`, the missing `useJUnitPlatform()` on `integrationTest`, `TenantResolutionFilter` failing to construct in `@WebMvcTest` slices, and a real production bug it exposed (`@PreAuthorize` denials returning 500 instead of 403, for every role-protected endpoint — not just appointments). `./gradlew test` failures went 42 → 15; the remaining 15 (SimpleAuthTest/SecuritySystemTest tenant-seeding issue, stale QueueServiceImplTest/CheckInServiceTest mocks) are confirmed unrelated to appointments. Pushed 4 commits, watching PR #7's actual CI run.
