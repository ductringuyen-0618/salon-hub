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

| Script              | What it does                            |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Run api and web in parallel             |
| `npm run api:dev`   | `./gradlew bootRun` inside `apps/api`   |
| `npm run api:build` | `./gradlew build` inside `apps/api`     |
| `npm run api:test`  | `./gradlew test` inside `apps/api`      |
| `npm run web:dev`   | `npm run dev` inside `apps/web`         |
| `npm run web:build` | `npm run build` inside `apps/web`       |
| `npm run web:test`  | `npm test` inside `apps/web`            |

## History

This repo was created by merging two previously separate repositories:

- `salon-hub-api` → `apps/api`
- `salon-hub-ui-v2` → `apps/web`

Full commit history from both repos has been preserved via `git subtree`.
