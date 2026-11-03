import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** A host written into the site's code is a host the owner cannot change after deployment. Addresses come from /config.json. */
const FORBIDDEN = /localhost|127\.0\.0\.1|\[::1\]|fly\.dev|vercel\.app|5nailsspa/i;
const ALLOW_FILES: string[] = [];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe("no hardcoded host in the site's source", () => {
  const root = join(__dirname);
  const source = files(root).filter((f) => /\.(ts|tsx)$/.test(f) && !/\.test\.(ts|tsx)$/.test(f) && !ALLOW_FILES.some((a) => f.endsWith(a)));

  it("scans real source files", () => {
    expect(source.length).toBeGreaterThan(10);
  });

  it.each(source.map((f) => [f.slice(root.length + 1), f]))("%s has no localhost, loopback, fly.dev, vercel.app or the old vendor's site", (_name, file) => {
    const hits = readFileSync(file, "utf8")
      .split(/\r?\n/)
      .map((line, i) => [i + 1, line] as const)
      .filter(([, line]) => FORBIDDEN.test(line));
    expect(hits).toEqual([]);
  });

  it("would catch a hardcoded host", () => {
    expect(FORBIDDEN.test('const u = "http://localhost:8788/salon"')).toBe(true);
    expect(FORBIDDEN.test("https://x.vercel.app")).toBe(true);
    expect(FORBIDDEN.test("https://book.example.com")).toBe(false);
  });
});
