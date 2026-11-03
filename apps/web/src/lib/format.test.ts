import { describe, expect, it } from "vitest";
import { formatClock, formatDuration, formatPrice, telHref, todayIn } from "./format";

describe("format", () => {
  it("formats cents as dollars", () => {
    expect(formatPrice(2500)).toBe("$25");
    expect(formatPrice(1050)).toBe("$10.50");
    expect(formatPrice(5)).toBe("$0.05");
    expect(formatPrice(0)).toBe("$0");
  });

  it("formats clock times", () => {
    expect(formatClock("00:00")).toBe("12:00 AM");
    expect(formatClock("12:30")).toBe("12:30 PM");
    expect(formatClock("18:05")).toBe("6:05 PM");
  });

  it("formats durations", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(60)).toBe("1 hr");
    expect(formatDuration(90)).toBe("1 hr 30 min");
  });

  it("builds a tel link without punctuation", () => {
    expect(telHref("+1 (208) 555-0100")).toBe("tel:+12085550100");
  });

  it("finds today in the salon zone, not the viewer zone", () => {
    const instant = new Date("2026-11-02T05:30:00Z");
    expect(todayIn("America/Boise", instant)).toBe("sun");
    expect(todayIn("Asia/Tokyo", instant)).toBe("mon");
  });
});
