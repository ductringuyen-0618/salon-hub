import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanUrl, loadConfig, resolveConfig } from "./config";

afterEach(() => vi.unstubAllGlobals());

describe("cleanUrl", () => {
  it.each(["http://127.0.0.1:8788/salon", "https://book.example.com", "  https://book.example.com/x?y=1  "])("keeps %j", (v) => {
    expect(cleanUrl(v)).toBe(v.trim());
  });
  it.each(["", "   ", "javascript:alert(1)", "data:text/html,hi", "ftp://x.example.com", "//book.example.com", "book.example.com", "not a url", "tel:2085550100", 5, null, undefined, {}])("ignores %j", (v) => {
    expect(cleanUrl(v)).toBeUndefined();
  });
});

describe("resolveConfig", () => {
  it("prefers the runtime file over the build time variables, field by field", () => {
    expect(resolveConfig({ salonUrl: "https://f.example.com/salon", bookingUrl: "https://b.example.com" }, { salonUrl: "https://env.example.com", bookingUrl: "https://envb.example.com" })).toEqual({
      salonUrl: "https://f.example.com/salon",
      bookingUrl: "https://b.example.com",
    });
    expect(resolveConfig({ salonUrl: "https://f.example.com/salon" }, { salonUrl: "https://env.example.com", bookingUrl: "https://envb.example.com" })).toEqual({
      salonUrl: "https://f.example.com/salon",
      bookingUrl: "https://envb.example.com",
    });
  });
  it("falls back to the variables when the file is missing", () => {
    expect(resolveConfig(null, { salonUrl: "https://env.example.com", bookingUrl: "https://envb.example.com" })).toEqual({ salonUrl: "https://env.example.com", bookingUrl: "https://envb.example.com" });
  });
  it("ignores an invalid file value and uses the variable, never a built in host", () => {
    expect(resolveConfig({ salonUrl: "javascript:1", bookingUrl: "nope" }, { salonUrl: "https://env.example.com" })).toEqual({ salonUrl: "https://env.example.com" });
    expect(resolveConfig({ salonUrl: 3, bookingUrl: "" }, {})).toEqual({});
  });
  it("passes the optional siteUrl when valid and drops other keys", () => {
    expect(resolveConfig({ siteUrl: "https://site.example.com", secret: "x" }, {})).toEqual({ siteUrl: "https://site.example.com" });
    expect(resolveConfig({ siteUrl: "ftp://x" }, {})).toEqual({});
  });
  it.each([null, undefined, "text", 5, [], [1]])("treats %j as no file", (v) => {
    expect(resolveConfig(v, {})).toEqual({});
  });
});

describe("loadConfig", () => {
  const ok = (body: unknown) => vi.fn().mockResolvedValue({ ok: true, json: async () => body });

  it("fetches /config.json once with no-store", async () => {
    const f = ok({ salonUrl: "https://f.example.com/salon", bookingUrl: "https://b.example.com" });
    vi.stubGlobal("fetch", f);
    expect(await loadConfig({})).toEqual({ salonUrl: "https://f.example.com/salon", bookingUrl: "https://b.example.com" });
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0]?.[0]).toBe("/config.json");
    expect(f.mock.calls[0]?.[1]).toMatchObject({ cache: "no-store" });
  });
  it("uses the variables when the file is a 404, an HTML page, or the network fails", async () => {
    const env = { salonUrl: "https://env.example.com", bookingUrl: "https://envb.example.com" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    expect(await loadConfig(env)).toEqual(env);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => Promise.reject(new SyntaxError("<!doctype")) }));
    expect(await loadConfig(env)).toEqual(env);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await loadConfig(env)).toEqual(env);
  });
  it("returns an empty config when nothing is set anywhere", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await loadConfig({})).toEqual({});
  });
});
