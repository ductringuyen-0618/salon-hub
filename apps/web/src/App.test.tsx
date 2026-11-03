import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { Salon } from "./lib/salon";

const salon: Salon = {
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
  services: [
    { serviceRef: "a", name: "Manicure", category: "Hands", kind: "service", durationMin: 30, fromPriceCents: 2500 },
    { serviceRef: "b", name: "Gel polish", category: "Hands", kind: "addon", durationMin: 15, fromPriceCents: 1050 },
    { serviceRef: "c", name: "Pedicure", category: "Feet", kind: "service", durationMin: 75, fromPriceCents: 4000 },
  ],
};

const reply = (body: unknown, ok = true) => vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 502, json: async () => body });
const props = { salonUrl: "http://fn.test/salon", bookingUrl: "https://book.example.com" };

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loading and error", () => {
  it("shows a plain loading state first", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<App {...props} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading salon details");
  });

  it("shows a plain error with retry and no phone when nothing is cached", async () => {
    vi.stubGlobal("fetch", reply({}, false));
    render(<App {...props} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("try again");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("still shows the cached phone number on error", async () => {
    localStorage.setItem("salon-hub:last-contact", JSON.stringify({ name: "Test Nails", phone: "(208) 555-0100" }));
    vi.stubGlobal("fetch", reply({}, false));
    render(<App {...props} />);
    const link = await screen.findByRole("link", { name: "(208) 555-0100" });
    expect(link).toHaveAttribute("href", "tel:2085550100");
  });

  it("treats a wrong shape as an error", async () => {
    vi.stubGlobal("fetch", reply({ name: "x" }));
    render(<App {...props} />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows the error when no function URL is configured", async () => {
    vi.stubGlobal("fetch", vi.fn());
    render(<App salonUrl="" bookingUrl="https://book.example.com" />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("retries when asked", async () => {
    const fn = vi.fn().mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({}) }).mockResolvedValueOnce({ ok: true, status: 200, json: async () => salon });
    vi.stubGlobal("fetch", fn);
    render(<App {...props} />);
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Test Nails" })).toBeInTheDocument();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("the home page", () => {
  it("fetches once and shows name, phone, address, hours and services", async () => {
    const fn = reply(salon);
    vi.stubGlobal("fetch", fn);
    render(<App {...props} />);
    expect(await screen.findByRole("heading", { level: 1, name: "Test Nails" })).toBeInTheDocument();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0]?.[0]).toBe("http://fn.test/salon");
    expect(screen.getAllByRole("link", { name: /\(208\) 555-0100/ })[0]).toHaveAttribute("href", "tel:2085550100");
    expect(screen.getByRole("link", { name: "View on map" })).toHaveAttribute("href", expect.stringContaining("google.com/maps/search/?api=1&query=1%20Main%20St"));
    const hours = screen.getByRole("region", { name: "Hours" });
    expect(within(hours).getByText("Sunday").nextSibling).toHaveTextContent("Closed");
    expect(within(hours).getByText("Saturday").nextSibling).toHaveTextContent("10:00 AM to 4:00 PM");
    expect(within(hours).getAllByRole("listitem")).toHaveLength(7);
  });

  it("groups services by category with price and duration, and marks add-ons", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByRole("heading", { level: 3, name: "Hands" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Feet" })).toBeInTheDocument();
    const manicure = screen.getByText("Manicure").closest("li")!;
    expect(manicure).toHaveTextContent("30 min, from $25");
    expect(screen.getByText("Gel polish").closest("li")).toHaveTextContent("Add-on");
    expect(screen.getByText("Gel polish").closest("li")).toHaveTextContent("from $10.50");
    expect(screen.getByText("Pedicure").closest("li")).toHaveTextContent("1 hr 15 min");
  });

  it("sets the page title and description from the salon name", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(document.title).toBe("Test Nails"));
  });

  it("links Book now to the booking page when online booking is on", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    expect(await screen.findByRole("link", { name: "Book now" })).toHaveAttribute("href", "https://book.example.com");
    expect(screen.queryByText(/To book, call/)).toBeNull();
  });

  it("opens the booking page in the same tab", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    const link = await screen.findByRole("link", { name: "Book now" });
    expect(link).not.toHaveAttribute("target");
  });

  it("hides Book now and shows a call line when online booking is off", async () => {
    vi.stubGlobal("fetch", reply({ ...salon, onlineBookingEnabled: false }));
    render(<App {...props} />);
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("link", { name: "Book now" })).toBeNull();
    expect(screen.getByText(/To book, call/)).toBeInTheDocument();
  });

  it("hides Book now when no booking URL is configured", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App salonUrl={props.salonUrl} bookingUrl="" />);
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("link", { name: "Book now" })).toBeNull();
  });

  it("hides phone, address and map links when the POS has none", async () => {
    vi.stubGlobal("fetch", reply({ ...salon, phone: "", address: "", onlineBookingEnabled: false }));
    render(<App {...props} />);
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Contact details are not listed yet.")).toBeInTheDocument();
  });

  it("says so when no services are listed", async () => {
    vi.stubGlobal("fetch", reply({ ...salon, services: [] }));
    render(<App {...props} />);
    expect(await screen.findByText("No services are listed yet.")).toBeInTheDocument();
  });

  it("remembers the contact for the next error", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await screen.findByRole("heading", { level: 1 });
    expect(JSON.parse(localStorage.getItem("salon-hub:last-contact")!)).toEqual({ name: "Test Nails", phone: "(208) 555-0100" });
  });
});

describe("not found", () => {
  it("shows a 404 for any other path and fetches nothing", () => {
    const fn = vi.fn();
    vi.stubGlobal("fetch", fn);
    render(<App {...props} path="/testing" />);
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/");
    expect(fn).not.toHaveBeenCalled();
  });
});
