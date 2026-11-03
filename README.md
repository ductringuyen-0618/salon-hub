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
| `apps/web` | Vite, React and Tailwind. A Home page, a Services page and a 404. One fetch of `config.json` at start, then one fetch of the salon function. |
| `apps/salon-function` | Node 22 and TypeScript, built to one file. `handle(request, deps)` is the testable core. `project.yml` and `packages/salon/get/` are the DigitalOcean Functions layout. |
| `.app.yaml` | DigitalOcean App Platform spec. Placeholders only, no secret values. |

## Environment variables

Function (`apps/salon-function/.env.example`):

| Name | Meaning |
| --- | --- |
| `POS_BASE_URL` | The POS origin, for example `https://pos.example.com`. No trailing path. |
| `POS_PARTNER_KEY_ID` | The key id shown in the POS. |
| `POS_PARTNER_SECRET` | The secret, shown once when the key is made. Function only. |
| `ALLOWED_ORIGIN` | The one site origin allowed by CORS. Compared as scheme, host and port, so a trailing slash, a path or an uppercase host is fine. A `*` is refused. A request that names any other `Origin` gets 403. |
| `SALON_CACHE_FRESH_SECONDS` | Optional. How long a POS reply is served without asking again. Default 60. A whole number from 1 to 3600. |
| `SALON_CACHE_STALE_SECONDS` | Optional. How long the last good reply is served, marked stale, when the POS is down. Default 600. Never shorter than the fresh window. |

## Web addresses: config.json

The site has no web address written into its code. It reads two addresses when it starts, from `/config.json`, fetched once with `no-store`. Copy `apps/web/public/config.example.json` to `apps/web/public/config.json` (the real file is gitignored) and fill it in:

```json
{ "salonUrl": "https://your-function-address/salon", "bookingUrl": "https://your-pos-booking-page", "siteUrl": "https://your-hub-address" }
```

| Key | Meaning |
| --- | --- |
| `salonUrl` | The salon function. The one data fetch uses it. |
| `bookingUrl` | The POS online booking page. Every Book now (header, hero, call to action, footer) uses it, and each service card adds `?service=<serviceRef>`. |
| `siteUrl` | Optional. This site's own address, used for the canonical link. |

Only `http` and `https` addresses count. Anything else is ignored. If a key is missing or invalid the site falls back to the build time variables `VITE_SALON_URL` and `VITE_BOOKING_URL` (`apps/web/.env.example`), and after that to a plain state. With no `salonUrl` the page says "This site is not set up yet" (and shows the phone from the last visit, if the browser remembers it). With no `bookingUrl` every Book now is hidden and the call line shows the salon phone. There is no built in host to fall back to.

**After deployment the owner edits `config.json` (or the two variables, then redeploys) and nothing else.** With `config.json` there is no code change and no rebuild. A test fails if a host such as `localhost` or `vercel.app` is written into `apps/web/src`.

Never put the partner secret in the web app. `config.json` and anything named `VITE_` is public.

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
cp apps/web/public/config.example.json apps/web/public/config.json   # then edit it
npm run dev
```

`ALLOWED_ORIGIN` must equal the origin the browser shows, for example `http://localhost:5173`.

## Behavior of the function

- `GET` only. `OPTIONS` answers CORS. Anything else is 405.
- Signs each call with a fresh nonce and timestamp. Keeps the POS reply in memory for 60 seconds.
- If the POS fails, it serves the last good reply for up to 10 minutes with `"stale": true`. After that it returns `502` with `{"error":"upstream_unavailable"}`.
- Waits 5 seconds for the POS. Never forwards a POS body or header. Logs no secret.
- Drops any field not in the contract and refuses a reply with a wrong shape.
- Replies carry `Cache-Control: public, max-age=30` (never longer than the fresh window).
- A request that sends an `Origin` other than `ALLOWED_ORIGIN` gets 403 `origin_not_allowed` with no CORS header. A request with no `Origin` is served.

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
