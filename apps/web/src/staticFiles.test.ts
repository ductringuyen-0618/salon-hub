import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const web = join(__dirname, "..");

describe("static files", () => {
  const html = readFileSync(join(web, "index.html"), "utf8");

  it("links a favicon that exists and carries the 5N mark", () => {
    expect(html).toMatch(/<link rel="icon"[^>]*href="\/favicon\.svg"/);
    const svg = readFileSync(join(web, "public", "favicon.svg"), "utf8");
    expect(svg).toContain("5N");
    expect(svg).toContain("#d34000");
  });

  it("has a neutral first title, not the word Salon", () => {
    const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "";
    expect(title.length).toBeGreaterThan(3);
    expect(title.trim().toLowerCase()).not.toBe("salon");
  });
});
