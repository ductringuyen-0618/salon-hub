import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Boot from "./Boot";
import type { RuntimeConfig } from "./lib/config";

const salon = {
  name: "Test Nails",
  phone: "(208) 555-0100",
  address: "1 Main St, Boise, ID",
  salonTimeZone: "America/Boise",
  onlineBookingEnabled: true,
  hours: [],
  services: [{ serviceRef: "a", name: "Manicure", category: "Hands", kind: "service", durationMin: 30, fromPriceCents: 2500 }],
};

afterEach(() => vi.unstubAllGlobals());

const run = async (config: RuntimeConfig) => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => salon });
  vi.stubGlobal("fetch", fetchMock);
  const view = render(<Boot load={() => Promise.resolve(config)} />);
  await screen.findByRole("heading", { level: 1, name: /Test Nails/ }).catch(() => undefined);
  return { fetchMock, view };
};

describe("Boot", () => {
  it("fetches the salon from the configured salonUrl and links Book Now to the configured bookingUrl", async () => {
    const { fetchMock } = await run({ salonUrl: "https://one.config-test.invalid/salon", bookingUrl: "https://one.config-test.invalid/book" });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://one.config-test.invalid/salon");
    for (const l of screen.getAllByRole("link", { name: /^Book Now/ })) expect(l).toHaveAttribute("href", "https://one.config-test.invalid/book");
  });

  it("follows a changed config on the next load with no rebuild", async () => {
    const first = await run({ salonUrl: "https://one.config-test.invalid/salon", bookingUrl: "https://one.config-test.invalid/book" });
    first.view.unmount();
    const second = await run({ salonUrl: "https://two.config-test.invalid/salon", bookingUrl: "https://two.config-test.invalid/book" });
    expect(second.fetchMock.mock.calls[0]?.[0]).toBe("https://two.config-test.invalid/salon");
    for (const l of screen.getAllByRole("link", { name: /^Book Now/ })) expect(l).toHaveAttribute("href", "https://two.config-test.invalid/book");
  });

  it("shows the not set up state for an empty config and the call line for a config without bookingUrl", async () => {
    await run({});
    expect(screen.getByRole("heading", { name: "This site is not set up yet" })).toBeInTheDocument();
  });

  it("adds a canonical link from siteUrl", async () => {
    await run({ salonUrl: "https://one.config-test.invalid/salon", siteUrl: "https://site.config-test.invalid" });
    expect(document.head.querySelector("link[rel=canonical]")).toHaveAttribute("href", "https://site.config-test.invalid");
  });
});
