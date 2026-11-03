import { describe, expect, it } from "vitest";
import { cityOf, featuredServices, homeStats, shortRange } from "./home";
import type { Salon, ServiceItem } from "./salon";

const svc = (name: string, category: string, cents: number, kind: ServiceItem["kind"] = "service"): ServiceItem => ({
  serviceRef: name,
  name,
  category,
  kind,
  durationMin: 30,
  fromPriceCents: cents,
});

describe("featuredServices", () => {
  it("puts the most expensive of each category first, then the rest by price", () => {
    const picked = featuredServices([svc("a", "hands", 2500), svc("b", "hands", 3500), svc("c", "feet", 4500), svc("d", "feet", 6000)]);
    expect(picked.map((s) => s.name)).toEqual(["b", "d", "c", "a"]);
  });

  it("breaks a price tie by list order and skips add-ons", () => {
    const picked = featuredServices([svc("x", "feet", 6500), svc("y", "feet", 6500), svc("z", "feet", 9000, "addon")]);
    expect(picked.map((s) => s.name)).toEqual(["x", "y"]);
  });

  it("keeps the first four categories when there are more", () => {
    const list = ["a", "b", "c", "d", "e"].map((c, i) => svc(c, c, 1000 + i));
    expect(featuredServices(list).map((s) => s.name)).toEqual(["a", "b", "c", "d"]);
  });

  it("fills up to four with the next most expensive services", () => {
    const picked = featuredServices([svc("a", "hands", 2500), svc("b", "hands", 3500), svc("c", "hands", 3000), svc("d", "feet", 4000)]);
    expect(picked.map((s) => s.name)).toEqual(["b", "d", "c", "a"]);
  });

  it("returns nothing for no services", () => {
    expect(featuredServices([])).toEqual([]);
  });
});

describe("hours and city", () => {
  it("shortens whole hours", () => {
    expect(shortRange({ day: "mon", open: "09:00", close: "19:00" })).toBe("9 AM to 7 PM");
    expect(shortRange({ day: "mon", open: "09:30", close: "19:00" })).toBe("9:30 AM to 7 PM");
    expect(shortRange({ day: "mon", closed: true })).toBe("Closed");
  });

  it("reads the city from a street address", () => {
    expect(cityOf("10751 C W Overland Road, Boise, ID 83709")).toBe("Boise");
    expect(cityOf("Boise")).toBe("");
    expect(cityOf("")).toBe("");
  });
});

describe("homeStats", () => {
  const salon: Salon = {
    name: "N",
    phone: "1",
    address: "1 Main St, Boise, ID 83709",
    salonTimeZone: "America/Boise",
    onlineBookingEnabled: true,
    hours: [{ day: "mon", open: "09:00", close: "19:00" }],
    services: [svc("a", "hands", 2500), svc("b", "hands", 1500, "addon"), svc("c", "feet", 4500)],
  };

  it("uses only values from the salon data", () => {
    const stats = homeStats(salon, "mon", []);
    expect(stats.map((s) => [s.label, s.value])).toEqual([
      ["Services offered", "2"],
      ["Prices start at", "$25"],
      ["Open today", "9 AM to 7 PM"],
      ["Find us in", "Boise"],
    ]);
  });

  it("skips what it does not know", () => {
    const stats = homeStats({ ...salon, services: [], address: "", hours: [] }, "mon", []);
    expect(stats).toEqual([]);
  });

  it("lets the owner's own stats replace the real ones", () => {
    expect(homeStats(salon, "mon", [{ label: "Open since", value: "2020" }]).map((s) => s.label)).toEqual(["Open since"]);
  });
});
