# Staff Management admin page — shipped

## What shipped
Replaced the `/admin/staff` "coming soon" placeholder with a real admin page (`apps/web/src/pages/AdminStaffPage.tsx`) wired at that route in `apps/web/src/App.tsx`. Owners can now list every employee (name, role, availability), add a new staff member, edit an existing one's name/role in place, remove a staff member (with a confirm step), and toggle availability per row — all through the existing, already tenant-scoped `/api/employees` CRUD + availability endpoints. No backend changes, no new dependencies.

## Commits
- `d9a8bb7` — `feat(web): add Staff Management admin page`

## Validator findings
Ran the exact commands from `.github/workflows/web-ci.yml` inside `apps/web`:
- `npm ci` — clean install
- `npm run lint` — 0 errors (new file adds 4 pre-existing-pattern warnings, same bar as `AdminServicesPage.tsx`)
- `npm run test:ci` — 52 passed, 14 skipped, 0 failed
- `npm run build` — succeeds, `AdminStaffPage` chunk emitted

## Reviewer notes
Loading, empty ("No staff yet — add your first team member"), and error-toast states all present; failed mutations leave the list unchanged. Destructive delete requires confirmation. Tenant isolation unchanged — no new query paths. Old placeholder route fully removed, not left reachable alongside the new page. Backend `Employee` model only carries name/role/available (no contact fields), so the form doesn't invent fields the API doesn't support.

## PR
https://github.com/ductringuyen-0618/salon-hub/pull/4

## CI run
https://github.com/ductringuyen-0618/salon-hub/actions/runs/34710414620/job/103598047911 (build-test — success)
