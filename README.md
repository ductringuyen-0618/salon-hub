# salon-hub

The public website for one nail salon. A static React site plus one small signing function. All salon facts (name, phone, address, hours, services, whether online booking is on) come from the salon's point of sale (SalonOS) through its partner API. This repo has no database and no login.

```
browser  ->  static site (apps/web)
browser  ->  salon function (apps/salon-function)  ->  POS  GET /partner/v1/salon
browser  ->  POS online booking page   (the Book now link)
```

The function exists because the partner API is signed with a secret. A browser must never hold that secret, so the function holds it, signs the request, caches the answer for 60 seconds and returns only the fields in the contract.

## Layout

| Path | What it is |
| --- | --- |
| `apps/web` | Vite, React and Tailwind. One Home page and one 404. One fetch of `VITE_SALON_URL`. |
| `apps/salon-function` | Node 22 and TypeScript, built to one file. `handle(request, deps)` is the testable core. `project.yml` and `packages/salon/get/` are the DigitalOcean Functions layout. |
| `.app.yaml` | DigitalOcean App Platform spec. Placeholders only, no secret values. |

## Environment variables

Function (`apps/salon-function/.env.example`):

| Name | Meaning |
| --- | --- |
| `POS_BASE_URL` | The POS origin, for example `https://pos.example.com`. No trailing path. |
| `POS_PARTNER_KEY_ID` | The key id shown in the POS. |
| `POS_PARTNER_SECRET` | The secret, shown once when the key is made. Function only. |
| `ALLOWED_ORIGIN` | The one site origin allowed by CORS. A `*` is refused. |

Web (`apps/web/.env.example`), read at build time and visible to every visitor:

| Name | Meaning |
| --- | --- |
| `VITE_SALON_URL` | The URL of the salon function. |
| `VITE_BOOKING_URL` | The POS online booking page. The Book now button uses it. |

Never put the partner secret in the web app. Anything named `VITE_` is public.

## Create the partner key in the POS

1. Sign in to the POS as the owner.
2. Open Settings, then the Website connection panel.
3. Create a key with a label such as `website`. The secret is shown once.
4. Put the key id and secret into the function's environment. Do not commit them and do not paste them into chat.
5. To rotate, create a second key, deploy it, then revoke the first.

## Run locally

```sh
npm install
npm test                 # web and function tests
npm run lint
npm run build
```

Function against a POS, using an untracked env file:

```sh
cd apps/salon-function
npm run build
node --env-file=.env.local dev-server.mjs      # http://127.0.0.1:8788
```

Web against that function:

```sh
VITE_SALON_URL=http://127.0.0.1:8788 VITE_BOOKING_URL=https://book.example.com npm run dev
```

`ALLOWED_ORIGIN` must equal the origin the browser shows, for example `http://localhost:5173`.

## Behavior of the function

- `GET` only. `OPTIONS` answers CORS. Anything else is 405.
- Signs each call with a fresh nonce and timestamp. Keeps the POS reply in memory for 60 seconds.
- If the POS fails, it serves the last good reply for up to 10 minutes with `"stale": true`. After that it returns `502` with `{"error":"upstream_unavailable"}`.
- Waits 5 seconds for the POS. Never forwards a POS body or header. Logs no secret.
- Drops any field not in the contract and refuses a reply with a wrong shape.
- Replies carry `Cache-Control: public, max-age=30`.

## Deploy on DigitalOcean

Nothing here deploys by itself. These steps are written from the documentation and have not been run.

Function with `doctl`:

```sh
cd apps/salon-function
npm run build
doctl serverless deploy . --env <path to an untracked env file>
doctl serverless functions get salon/get --url
```

Static site and function with App Platform: copy `.app.yaml`, replace `OWNER/salon-hub` and every `REPLACE_` value, then create the app from the dashboard. Enter the two `SECRET` values in the dashboard. The function bundle `packages/salon/get/index.js` is a build output and is not committed, so the function component needs a build step on DigitalOcean that has not been confirmed. If it does not build, deploy the function with `doctl` and keep App Platform for the static site only.

The POS must be reachable from DigitalOcean for the function to work, and the Book now link needs the POS booking page to be public.
