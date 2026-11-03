import { describe, expect, it } from "vitest";
import { siteCopy } from "./siteCopy";

describe("siteCopy", () => {
  it("has the shape the pages use", () => {
    expect(siteCopy.tagline).toBeTruthy();
    expect(siteCopy.hero.titleTop).toBeTruthy();
    expect(siteCopy.hero.titleAccent).toBeTruthy();
    expect(siteCopy.why.cards).toHaveLength(4);
    for (const c of siteCopy.why.cards) {
      expect(c.title && c.description).toBeTruthy();
      expect(["sparkles", "heart", "users", "calendar", "tag", "clock"]).toContain(c.icon);
    }
    expect(siteCopy.cta.title && siteCopy.cta.primary && siteCopy.cta.secondary).toBeTruthy();
  });

  it("ships no owner stats", () => {
    expect(siteCopy.stats).toEqual([]);
  });

  it("makes no numeric or certification claims by default", () => {
    const text = JSON.stringify(siteCopy);
    expect(text).not.toMatch(/\d/);
    expect(text).not.toMatch(/licensed|insured|certified|hospital|sterili|rating|years|happy clients/i);
  });
});
