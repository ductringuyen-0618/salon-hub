import { randomBytes } from "node:crypto";
import { parseSalon, type Salon } from "./contract.js";
import { SALON_PATH, signHeaders } from "./sign.js";

export const FRESH_MS = 60_000;
export const STALE_MS = 10 * 60_000;
export const TIMEOUT_MS = 5_000;
const MAX_BYTES = 256 * 1024;

export interface Cache {
  salon: Salon | null;
  at: number;
  inflight: Promise<Salon | null> | null;
}

export interface Deps {
  env: Record<string, string | undefined>;
  fetch: typeof fetch;
  now: () => number;
  nonce: () => string;
  log: (line: string) => void;
  cache: Cache;
}

export interface Req {
  method: string;
}

export interface Res {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export const newCache = (): Cache => ({ salon: null, at: 0, inflight: null });

export const realDeps = (): Deps => ({
  env: process.env,
  fetch: (input, init) => fetch(input, init),
  now: () => Date.now(),
  nonce: () => randomBytes(18).toString("base64url"),
  log: (line) => console.log(line),
  cache: newCache(),
});

const json = (statusCode: number, headers: Record<string, string>, value: unknown): Res => ({
  statusCode,
  headers: { ...headers, "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(value),
});

async function readCapped(res: Response): Promise<string | null> {
  const text = await res.text();
  return text.length > MAX_BYTES ? null : text;
}

async function fromPos(deps: Deps, base: string, keyId: string, secret: string): Promise<Salon | null> {
  const timestamp = String(Math.floor(deps.now() / 1000));
  const headers = signHeaders({ keyId, secret, timestamp, nonce: deps.nonce() });
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await deps.fetch(`${base}${SALON_PATH}`, { method: "GET", headers: { ...headers, accept: "application/json" }, redirect: "error", signal: ctl.signal });
    if (res.status !== 200) {
      deps.log(`pos_status ${res.status}`);
      return null;
    }
    const text = await readCapped(res);
    if (text === null) {
      deps.log("pos_reply_too_large");
      return null;
    }
    const salon = parseSalon(JSON.parse(text));
    if (salon === null) deps.log("pos_reply_bad_shape");
    return salon;
  } catch (e) {
    deps.log(`pos_unreachable ${e instanceof Error ? e.name : "error"}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function handle(req: Req, deps: Deps): Promise<Res> {
  const origin = deps.env.ALLOWED_ORIGIN;
  const base = deps.env.POS_BASE_URL?.replace(/\/+$/, "");
  const keyId = deps.env.POS_PARTNER_KEY_ID;
  const secret = deps.env.POS_PARTNER_SECRET;
  const missing = [["ALLOWED_ORIGIN", origin], ["POS_BASE_URL", base], ["POS_PARTNER_KEY_ID", keyId], ["POS_PARTNER_SECRET", secret]].filter(([, v]) => !v || v === "*").map(([k]) => k);
  if (missing.length > 0 || !origin || !base || !keyId || !secret) {
    deps.log(`not_configured ${missing.join(",")}`);
    return json(500, { "cache-control": "no-store" }, { error: "not_configured" });
  }

  const cors = { "access-control-allow-origin": origin, vary: "Origin" };
  if (req.method === "OPTIONS") {
    return { statusCode: 204, headers: { ...cors, "access-control-allow-methods": "GET, OPTIONS", "access-control-max-age": "600" }, body: "" };
  }
  if (req.method !== "GET") return json(405, { ...cors, allow: "GET, OPTIONS", "cache-control": "no-store" }, { error: "method_not_allowed" });

  const { cache } = deps;
  const age = () => deps.now() - cache.at;
  if (cache.salon !== null && age() < FRESH_MS) return json(200, { ...cors, "cache-control": "public, max-age=30" }, cache.salon);

  cache.inflight ??= fromPos(deps, base, keyId, secret).finally(() => {
    cache.inflight = null;
  });
  const fresh = await cache.inflight;
  if (fresh !== null) {
    cache.salon = fresh;
    cache.at = deps.now();
    return json(200, { ...cors, "cache-control": "public, max-age=30" }, fresh);
  }
  if (cache.salon !== null && age() < STALE_MS) return json(200, { ...cors, "cache-control": "public, max-age=30" }, { ...cache.salon, stale: true });
  return json(502, { ...cors, "cache-control": "no-store" }, { error: "upstream_unavailable" });
}
