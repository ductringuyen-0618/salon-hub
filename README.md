# salon-hub

Monorepo containing the salon-hub backend and frontend.

## Structure

```
salon-hub/
├── apps/
│   ├── api/    # Spring Boot backend (Java + Gradle)
│   └── web/    # React frontend (Vite + TypeScript)
└── package.json
```

Each app keeps its own build tooling, dependencies, and configuration. The
root `package.json` only provides convenience scripts that delegate into the
two apps.

## Prerequisites

- JDK 17+ (for `apps/api`)
- Node.js 20+ and npm (for `apps/web`)
- Docker (optional, for running the API via `docker-compose`)

## Getting started

Install web dependencies:

```bash
cd apps/web && npm install
```

Run the API (from the repo root):

```bash
npm run api:dev          # ./gradlew bootRun
```

Run the web app (from the repo root):

```bash
npm run web:dev          # vite dev server
```

Run both at once:

```bash
npm run dev              # starts api + web in parallel
```

## Common scripts

| Script                | What it does                                          |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`         | Run api and web in parallel                           |
| `npm run api:dev`     | `./gradlew bootRun` inside `apps/api`                 |
| `npm run api:build`   | `./gradlew bootJar` inside `apps/api`                 |
| `npm run api:test`    | `./gradlew test` inside `apps/api`                    |
| `npm run web:dev`     | `npm run dev` inside `apps/web`                       |
| `npm run web:build`   | `tsc && vite build` inside `apps/web`                 |
| `npm run web:test`    | `vitest run --passWithNoTests` inside `apps/web`      |
| `npm run web:lint`    | `eslint .` inside `apps/web`                          |
| `npm run lint`        | Alias for `web:lint`                                  |
| `npm run test`        | `api:test` then `web:test`                            |
| `npm run build`       | `api:build` then `web:build`                          |
| `npm run verify:web`  | `web:lint` → `web:test` → `web:build` (no JDK needed) |
| `npm run ci`          | Full gate: install → lint → test → build (needs a JDK for `api:test`) |

## Verification loop

Before committing, run the loop appropriate to what you touched:

- **Web-only change:** `npm run verify:web` from the repo root, or `npm run lint && npm run test:ci && npm run build` from `apps/web`. Needs only Node 20+; no JDK required.
- **API-only or full-stack change:** `npm run ci` from the repo root. Needs JDK 17+ (`apps/api` won't build or test without it) and, for `api:integration-test`, a reachable Postgres (`apps/api/docker-compose.yml` starts one locally).
- **CI:** `.github/workflows/web-ci.yml` and `.github/workflows/api-ci.yml` run the same checks on every push/PR touching their respective `apps/*` path. Web CI now fails on lint errors (it used to ignore them); API CI runs unit + integration tests against a Postgres service container before building the jar.

`apps/web/eslint.config.js` excludes `src/components/ui` (shadcn-generated primitives) and `src/stories` (tempo-devtools scaffolding) from lint since neither is hand-authored app code. `npm run lint` (used in CI) fails only on lint errors; `apps/web`'s `lint:strict` also enforces zero warnings, for anyone burning down the pre-existing `no-explicit-any`/`no-unused-vars`/`exhaustive-deps` warning backlog.

## History

This repo was created by merging two previously separate repositories:

- `salon-hub-api` → `apps/api`
- `salon-hub-ui-v2` → `apps/web`

Full commit history from both repos has been preserved via `git subtree`.

## Deployment targets

- **API (apps/api)**: Fly.io — see `apps/api/fly.toml`. Uses Fly Postgres for
  the database. Deploy with `flyctl deploy` from `apps/api/`.
- **Web (apps/web)**: Vercel. Vercel's "Root Directory" project setting must
  point to `apps/web/`. `apps/web/vercel.json` configures the rewrite for SPA
  routing.
- **Auth**: Supabase (planned). Migration in progress — replacing the legacy
  custom Spring JWT with Supabase Auth so the frontend can use email +
  Google OAuth + magic links without the backend owning passwords.
