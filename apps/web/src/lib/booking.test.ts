import { describe, expect, it } from "vitest";
import { bookingHref, monogram } from "./booking";

describe("bookingHref", () => {
  it("adds the service id to the booking page", () => {
    expect(bookingHref("https://book.example.com", "svc_1")).toBe("https://book.example.com/?service=svc_1");
  });

  it("keeps the path, an existing query and a hash", () => {
    const url = new URL(bookingHref("https://book.example.com/start?ref=hub#top", "svc_1"));
    expect(url.pathname).toBe("/start");
    expect(url.searchParams.get("ref")).toBe("hub");
    expect(url.searchParams.get("service")).toBe("svc_1");
    expect(url.hash).toBe("#top");
  });

  it("replaces a service already in the address instead of repeating it", () => {
    expect(new URL(bookingHref("https://book.example.com/?service=old", "new")).searchParams.getAll("service")).toEqual(["new"]);
  });

  it("encodes an id that has odd characters", () => {
    expect(new URL(bookingHref("https://book.example.com", "a b&c")).searchParams.get("service")).toBe("a b&c");
  });

  it("returns an address without a service when there is no id", () => {
    expect(bookingHref("https://book.example.com/start", undefined)).toBe("https://book.example.com/start");
  });

  it("returns the address as given when it cannot be parsed", () => {
    expect(bookingHref("not a url", "x")).toBe("not a url");
  });
});

describe("monogram", () => {
  it.each([
    ["5 Nails & Spa", "5N"],
    ["Test Nails", "TN"],
    ["lotus", "L"],
    ["  ", "S"],
  ])("%s is %s", (name, mark) => {
    expect(monogram(name)).toBe(mark);
  });
});
