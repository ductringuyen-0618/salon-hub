import { createHash, createHmac } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { FRESH_MS, STALE_MS, handle, newCache, type Deps } from "./handler.js";

const KEY = "key_ABCDEFGH12";
const SECRET = "test-secret-not-real-0123456789";
const ORIGIN = "https://salon.example.com";

const good = {
  contractVersion: "1",
  name: "Test Nails",
  phone: "(208) 555-0100",
  address: "1 Main St, Boise, ID",
  salonTimeZone: "America/Boise",
  onlineBookingEnabled: true,
  hours: [
    { day: "sun", closed: true },
    { day: "mon", open: "09:00", close: "18:00" },
    { day: "tue", open: "09:00", close: "18:00" },
    { day: "wed", open: "09:00", close: "18:00" },
    { day: "thu", open: "09:00", close: "18:00" },
    { day: "fri", open: "09:00", close: "18:00" },
    { day: "sat", open: "10:00", close: "16:00" },
  ],
  services: [{ serviceRef: "svc1", name: "Manicure", category: "Hands", kind: "service", durationMin: 30, fromPriceCents: 2500 }],
  leadTimeMin: 120,
  maxDaysAhead: 60,
  maxGuests: 6,
};

/** Checks the request the way the POS does, so a wrong signature fails here too. */
function pos(reply: () => { status: number; body: unknown } = () => ({ status: 200, body: good })) {
  const seen: Array<{ url: string; headers: Record<string, string>; method: string }> = [];
  const fn = (async (url: string, init: RequestInit) => {
    const headers = init.headers as Record<string, string>;
    seen.push({ url, headers, method: String(init.method) });
    const path = new URL(url).pathname;
    const canonical = ["SALONOS-PARTNER-V1", headers["x-partner-key-id"], init.method, path, "", headers["x-partner-timestamp"], headers["x-partner-nonce"], createHash("sha256").update("").digest("hex")].join("\n");
    const expected = createHmac("sha256", SECRET).update(canonical).digest("hex");
    if (headers["x-partner-signature"] !== expected) return new Response('{"error":"unauthorized","secret":"leak"}', { status: 401, headers: { "set-cookie": "a=b", "x-pos-internal": "1" } });
    const r = reply();
    return new Response(JSON.stringify(r.body), { status: r.status });
  }) as unknown as typeof fetch;
  return { fn, seen };
}

let clock = 1_767_225_600_000;
let counter = 0;
const logs: string[] = [];

function deps(fn: typeof fetch, env: Record<string, string | undefined> = {}): Deps {
  return {
    env: { POS_BASE_URL: "http://pos.test/", POS_PARTNER_KEY_ID: KEY, POS_PARTNER_SECRET: SECRET, ALLOWED_ORIGIN: ORIGIN, ...env },
    fetch: fn,
    now: () => clock,
    nonce: () => `nonce${String(++counter).padStart(16, "0")}`,
    log: (l) => logs.push(l),
    cache: newCache(),
  };
}

const get = { method: "GET" };

beforeEach(() => {
  clock = 1_767_225_600_000;
  counter = 0;
  logs.length = 0;
});

describe("the happy path", () => {
  it("signs, calls the POS and returns the salon with CORS and cache headers", async () => {
    const p = pos();
    const res = await handle(get, deps(p.fn));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual(good);
    expect(res.headers["access-control-allow-origin"]).toBe(ORIGIN);
    expect(res.headers["cache-control"]).toBe("public, max-age=30");
    expect(p.seen).toHaveLength(1);
    expect(p.seen[0]?.url).toBe("http://pos.test/partner/v1/salon");
    expect(p.seen[0]?.headers["x-partner-timestamp"]).toBe("1767225600");
  });

  it("uses a fresh nonce on every POS call", async () => {
    const p = pos();
    const d = deps(p.fn);
    await handle(get, d);
    clock += FRESH_MS + 1;
    await handle(get, d);
    expect(p.seen).toHaveLength(2);
    expect(p.seen[0]?.headers["x-partner-nonce"]).not.toBe(p.seen[1]?.headers["x-partner-nonce"]);
  });
});

describe("the allowlist", () => {
  it("drops unknown fields at every level", async () => {
    const dirty = { ...good, internalNote: "x", hours: good.hours.map((h) => ({ ...h, extra: 1 })), services: [{ ...good.services[0], costCents: 900 }] };
    const res = await handle(get, deps(pos(() => ({ status: 200, body: dirty })).fn));
    expect(JSON.parse(res.body)).toEqual(good);
  });

  it.each([
    ["wrong contract version", { ...good, contractVersion: "2" }],
    ["missing name", { ...good, name: undefined }],
    ["phone not a string", { ...good, phone: 5 }],
    ["six hours", { ...good, hours: good.hours.slice(1) }],
    ["bad clock", { ...good, hours: [{ day: "sun", open: "25:00", close: "18:00" }, ...good.hours.slice(1)] }],
    ["bad day", { ...good, hours: [{ day: "xyz", closed: true }, ...good.hours.slice(1)] }],
    ["negative price", { ...good, services: [{ ...good.services[0], fromPriceCents: -1 }] }],
    ["float price", { ...good, services: [{ ...good.services[0], fromPriceCents: 2.5 }] }],
    ["bad kind", { ...good, services: [{ ...good.services[0], kind: "package" }] }],
    ["flag not boolean", { ...good, onlineBookingEnabled: "yes" }],
    ["not an object", [1, 2]],
  ])("fails closed on %s", async (_n, body) => {
    const res = await handle(get, deps(pos(() => ({ status: 200, body })).fn));
    expect(res.statusCode).toBe(502);
    expect(res.body).toBe('{"error":"upstream_unavailable"}');
  });
});

describe("failures never leak the POS", () => {
  it("returns a clean error for a wrong secret and forwards no body or header", async () => {
    const p = pos();
    const res = await handle(get, deps(p.fn, { POS_PARTNER_SECRET: "wrong-secret-not-real-000000000" }));
    expect(res.statusCode).toBe(502);
    expect(res.body).toBe('{"error":"upstream_unavailable"}');
    expect(res.body).not.toContain("leak");
    expect(Object.keys(res.headers)).not.toContain("set-cookie");
    expect(Object.keys(res.headers)).not.toContain("x-pos-internal");
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("never logs a secret", async () => {
    await handle(get, deps(pos().fn, { POS_PARTNER_SECRET: "wrong-secret-not-real-000000000" }));
    const boom = (async () => {
      throw new Error(SECRET);
    }) as unknown as typeof fetch;
    await handle(get, deps(boom));
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.join("\n")).not.toContain(SECRET);
    expect(logs.join("\n")).not.toContain("wrong-secret");
  });

  it("aborts a slow POS after the timeout", async () => {
    const hang = ((_u: string, init: RequestInit) =>
      new Promise((_r, rej) => init.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError"))))) as unknown as typeof fetch;
    const start = Date.now();
    const res = await handle(get, deps(hang));
    expect(res.statusCode).toBe(502);
    expect(Date.now() - start).toBeLessThan(6000);
  }, 8000);

  it("refuses an oversized reply", async () => {
    const big = (async () => new Response("x".repeat(300_000), { status: 200 })) as unknown as typeof fetch;
    expect((await handle(get, deps(big))).statusCode).toBe(502);
  });
});

describe("the cache", () => {
  it("serves from memory for 60 seconds", async () => {
    const p = pos();
    const d = deps(p.fn);
    await handle(get, d);
    clock += FRESH_MS - 1;
    const res = await handle(get, d);
    expect(p.seen).toHaveLength(1);
    expect(JSON.parse(res.body).stale).toBeUndefined();
  });

  it("asks the POS again after 60 seconds", async () => {
    const p = pos();
    const d = deps(p.fn);
    await handle(get, d);
    clock += FRESH_MS;
    await handle(get, d);
    expect(p.seen).toHaveLength(2);
  });

  it("shares one POS call between concurrent requests", async () => {
    const p = pos();
    const d = deps(p.fn);
    await Promise.all([handle(get, d), handle(get, d), handle(get, d)]);
    expect(p.seen).toHaveLength(1);
  });

  it("serves the stale reply marked stale when the POS fails, up to 10 minutes", async () => {
    let up = true;
    const p = pos(() => (up ? { status: 200, body: good } : { status: 503, body: { error: "down" } }));
    const d = deps(p.fn);
    await handle(get, d);
    up = false;
    clock += FRESH_MS + 1000;
    const res = await handle(get, d);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ...good, stale: true });
    clock += STALE_MS;
    expect((await handle(get, d)).statusCode).toBe(502);
  });

  it("recovers to a fresh reply when the POS returns", async () => {
    let up = true;
    const p = pos(() => (up ? { status: 200, body: good } : { status: 500, body: {} }));
    const d = deps(p.fn);
    await handle(get, d);
    up = false;
    clock += FRESH_MS + 1;
    expect(JSON.parse((await handle(get, d)).body).stale).toBe(true);
    up = true;
    clock += FRESH_MS;
    expect(JSON.parse((await handle(get, d)).body).stale).toBeUndefined();
  });

  it("does not cache a bad shape over a good reply", async () => {
    let bad = false;
    const p = pos(() => ({ status: 200, body: bad ? { ...good, name: 1 } : good }));
    const d = deps(p.fn);
    await handle(get, d);
    bad = true;
    clock += FRESH_MS + 1;
    expect(JSON.parse((await handle(get, d)).body)).toEqual({ ...good, stale: true });
  });
});

describe("CORS and methods", () => {
  it("answers OPTIONS for the allowed origin only", async () => {
    const p = pos();
    const res = await handle({ method: "OPTIONS" }, deps(p.fn));
    expect(res.statusCode).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe(ORIGIN);
    expect(res.headers["access-control-allow-methods"]).toBe("GET, OPTIONS");
    expect(p.seen).toHaveLength(0);
  });

  it.each(["POST", "PUT", "DELETE", "PATCH"])("rejects %s with 405 and calls no POS", async (method) => {
    const p = pos();
    const res = await handle({ method }, deps(p.fn));
    expect(res.statusCode).toBe(405);
    expect(res.headers.allow).toBe("GET, OPTIONS");
    expect(p.seen).toHaveLength(0);
  });

  it.each(["GET", "OPTIONS"])("gives a foreign Origin on %s a 403 with no CORS header and no POS call", async (method) => {
    const p = pos();
    const res = await handle({ method, origin: "https://evil.example.net" }, deps(p.fn));
    expect(res.statusCode).toBe(403);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    expect(res.body).toBe('{"error":"origin_not_allowed"}');
    expect(p.seen).toHaveLength(0);
  });

  it("serves the allowed origin and a request that sends no Origin", async () => {
    expect((await handle({ method: "GET", origin: ORIGIN }, deps(pos().fn))).statusCode).toBe(200);
    expect((await handle({ method: "GET" }, deps(pos().fn))).statusCode).toBe(200);
  });

  describe("ALLOWED_ORIGIN is compared as an origin", () => {
    it.each([
      ["a trailing slash", "https://salon.example.com/", "https://salon.example.com"],
      ["an uppercase host", "https://SALON.Example.com", "https://salon.example.com"],
      ["the default port written out", "https://salon.example.com:443", "https://salon.example.com"],
      ["a path in the setting", "https://salon.example.com/some/page?x=1", "https://salon.example.com"],
      ["surrounding spaces", "  https://salon.example.com  ", "https://salon.example.com"],
    ])("accepts the site when the setting has %s", async (_n, setting, sent) => {
      const res = await handle({ method: "GET", origin: sent }, deps(pos().fn, { ALLOWED_ORIGIN: setting }));
      expect(res.statusCode).toBe(200);
      expect(res.headers["access-control-allow-origin"]).toBe("https://salon.example.com");
    });

    it("accepts a browser Origin written with an uppercase host or the default port", async () => {
      for (const sent of ["https://SALON.example.com", "https://salon.example.com:443"]) {
        expect((await handle({ method: "GET", origin: sent }, deps(pos().fn))).statusCode).toBe(200);
      }
    });

    it("keeps a non default port significant", async () => {
      const env = { ALLOWED_ORIGIN: "http://hub.example.test:5310/" };
      expect((await handle({ method: "GET", origin: "http://hub.example.test:5310" }, deps(pos().fn, env))).statusCode).toBe(200);
      expect((await handle({ method: "GET", origin: "http://hub.example.test" }, deps(pos().fn, env))).statusCode).toBe(403);
      expect((await handle({ method: "GET", origin: "http://hub.example.test:5311" }, deps(pos().fn, env))).statusCode).toBe(403);
    });

    it.each(["https://evil.example.net", "http://salon.example.com", "https://salon.example.com.evil.net", "https://evil.net/https://salon.example.com", "null", "not a url"])(
      "still refuses %s with a trailing slash setting",
      async (sent) => {
        const p = pos();
        const res = await handle({ method: "GET", origin: sent }, deps(p.fn, { ALLOWED_ORIGIN: "https://salon.example.com/" }));
        expect(res.statusCode).toBe(403);
        expect(res.headers["access-control-allow-origin"]).toBeUndefined();
        expect(p.seen).toHaveLength(0);
      },
    );

    it.each(["salon.example.com", "ftp://salon.example.com", "https://"])("treats the unusable setting %s as not configured", async (setting) => {
      const res = await handle(get, deps(pos().fn, { ALLOWED_ORIGIN: setting }));
      expect(res.statusCode).toBe(500);
    });
  });

  it("uses SALON_CACHE_FRESH_SECONDS and SALON_CACHE_STALE_SECONDS, and tells the browser no longer than the fresh window", async () => {
    const env = { SALON_CACHE_FRESH_SECONDS: "2", SALON_CACHE_STALE_SECONDS: "6" };
    const p = pos();
    const d = deps(p.fn, env);
    const first = await handle(get, d);
    expect(first.headers["cache-control"]).toBe("public, max-age=2");
    await handle(get, d);
    expect(p.seen).toHaveLength(1);
    clock += 2_001;
    await handle(get, d);
    expect(p.seen).toHaveLength(2);
    const down = deps(async () => new Response("no", { status: 500 }), env);
    down.cache = d.cache;
    clock += 2_001;
    expect(JSON.parse((await handle(get, down)).body).stale).toBe(true);
    clock += 6_000;
    expect((await handle(get, down)).statusCode).toBe(502);
  });

  it.each(["0", "-1", "abc", "", "1e9"])("ignores the cache setting %j and keeps the defaults", async (bad) => {
    const p = pos();
    const d = deps(p.fn, { SALON_CACHE_FRESH_SECONDS: bad, SALON_CACHE_STALE_SECONDS: bad });
    expect((await handle(get, d)).headers["cache-control"]).toBe("public, max-age=30");
    clock += FRESH_MS - 1;
    await handle(get, d);
    expect(p.seen).toHaveLength(1);
  });

  it("refuses a wildcard origin as a misconfiguration", async () => {
    const res = await handle(get, deps(pos().fn, { ALLOWED_ORIGIN: "*" }));
    expect(res.statusCode).toBe(500);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it.each(["POS_BASE_URL", "POS_PARTNER_KEY_ID", "POS_PARTNER_SECRET", "ALLOWED_ORIGIN"])("fails clearly when %s is missing", async (name) => {
    const p = pos();
    const res = await handle(get, deps(p.fn, { [name]: undefined }));
    expect(res.statusCode).toBe(500);
    expect(res.body).toBe('{"error":"not_configured"}');
    expect(p.seen).toHaveLength(0);
  });
});
