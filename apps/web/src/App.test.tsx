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

  it("shows a not set up state, with the last known phone, when no function URL is configured", async () => {
    localStorage.setItem("salon-hub:last-contact", JSON.stringify({ name: "Test Nails", phone: "(208) 555-0100" }));
    vi.stubGlobal("fetch", vi.fn());
    render(<App salonUrl="" bookingUrl="https://book.example.com" />);
    expect(await screen.findByRole("heading", { name: "This site is not set up yet" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "(208) 555-0100" })).toHaveAttribute("href", "tel:2085550100");
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows the not set up state without a crash when nothing is remembered", () => {
    vi.stubGlobal("fetch", vi.fn());
    render(<App />);
    expect(screen.getByRole("heading", { name: "This site is not set up yet" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("retries when asked", async () => {
    const fn = vi.fn().mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({}) }).mockResolvedValueOnce({ ok: true, status: 200, json: async () => salon });
    vi.stubGlobal("fetch", fn);
    render(<App {...props} />);
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { level: 1, name: /Test Nails/ })).toBeInTheDocument();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

const heading = () => screen.findByRole("heading", { level: 1, name: /Test Nails/ });

describe("the home page", () => {
  it("fetches once and shows name, phone, address and today's hours", async () => {
    const fn = reply(salon);
    vi.stubGlobal("fetch", fn);
    render(<App {...props} />);
    await heading();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0]?.[0]).toBe("http://fn.test/salon");
    expect(screen.getAllByRole("link", { name: /\(208\) 555-0100/ })[0]).toHaveAttribute("href", "tel:2085550100");
    expect(screen.getByRole("link", { name: "1 Main St, Boise, ID" })).toHaveAttribute("href", expect.stringContaining("google.com/maps/search/?api=1&query=1%20Main%20St"));
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByText(/Today, \w+day: /)).toBeInTheDocument();
    expect(within(footer).getAllByRole("listitem")).toHaveLength(7);
    expect(within(footer).getByText("Sunday").nextSibling).toHaveTextContent("Closed");
  });

  it("shows only real values in the stat band", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await heading();
    expect(screen.getByText("Services offered").previousSibling).toHaveTextContent("2");
    expect(screen.getByText("Prices start at").previousSibling).toHaveTextContent("$25");
    expect(screen.getByText("Find us in").previousSibling).toHaveTextContent("Boise");
    expect(screen.queryByText(/2,500|4\.9|Licensed|Hospital/i)).toBeNull();
  });

  it("shows featured services with price, time and Book now", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await heading();
    const popular = screen.getByRole("region", { name: "Popular Services" });
    expect(within(popular).getByText("Manicure").closest("div.rounded-xl")).toHaveTextContent("$25");
    expect(within(popular).getByText("Pedicure").closest("div.rounded-xl")).toHaveTextContent("1 hr 15 min");
    expect(within(popular).queryByText("Gel polish")).toBeNull();
    expect(within(popular).getAllByRole("link", { name: /^Book now: / })).toHaveLength(2);
  });

  it("sets the page title from the salon name", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await heading();
    await waitFor(() => expect(document.title).toBe("Test Nails"));
  });

  it("links the booking buttons to the booking page in the same tab", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await heading();
    const links = screen.getAllByRole("link", { name: /^Book now/ });
    expect(links.length).toBeGreaterThanOrEqual(5);
    for (const l of links) {
      const href = l.getAttribute("href")!;
      expect(href === "https://book.example.com" || href.startsWith("https://book.example.com/?service=")).toBe(true);
      expect(l).not.toHaveAttribute("target");
    }
    expect(screen.queryByText(/To book, call/)).toBeNull();
  });

  it("has Call us in place of the old sign in and walk-in buttons", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await heading();
    expect(screen.getByRole("link", { name: "Call us" })).toHaveAttribute("href", "tel:2085550100");
    expect(screen.queryByText(/Sign In|Sign Up|Walk-in|Check In/i)).toBeNull();
  });

  it("hides every Book now and shows a call line when online booking is off", async () => {
    vi.stubGlobal("fetch", reply({ ...salon, onlineBookingEnabled: false }));
    render(<App {...props} />);
    await heading();
    expect(screen.queryByRole("link", { name: /^Book now/ })).toBeNull();
    expect(screen.getByText(/To book, call/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Call us" })).toBeInTheDocument();
  });

  it("hides booking when no booking URL is configured", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App salonUrl={props.salonUrl} bookingUrl="" />);
    await heading();
    expect(screen.queryByRole("link", { name: /^Book now/ })).toBeNull();
  });

  it("hides phone, address and map links when the POS has none", async () => {
    vi.stubGlobal("fetch", reply({ ...salon, phone: "", address: "", onlineBookingEnabled: false }));
    render(<App {...props} />);
    await heading();
    expect(screen.queryByRole("link", { name: "Call us" })).toBeNull();
    expect(screen.queryByRole("link", { name: /maps|Main St/ })).toBeNull();
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
    await heading();
    expect(JSON.parse(localStorage.getItem("salon-hub:last-contact")!)).toEqual({ name: "Test Nails", phone: "(208) 555-0100" });
  });

  it("opens and closes the mobile menu", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await heading();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(within(screen.getByRole("navigation", { name: "Mobile" })).getByRole("link", { name: "Services" })).toHaveAttribute("href", "/services");
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("navigation", { name: "Mobile" })).toBeNull();
  });
});

describe("addresses come from the configuration", () => {
  const booking = "https://booking.config-test.invalid/start";

  it("builds every link that leaves the page from bookingUrl, and the phone link from the salon data", async () => {
    vi.stubGlobal("fetch", reply(salon));
    const { container } = render(<App salonUrl="http://fn.config-test.invalid/salon" bookingUrl={booking} />);
    await heading();
    const hrefs = [...container.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")!);
    const outbound = hrefs.filter((h) => !h.startsWith("/") && !h.startsWith("#") && !h.startsWith("tel:") && !h.includes("google.com/maps"));
    expect(outbound.length).toBeGreaterThanOrEqual(5);
    expect(new Set(outbound.map((h) => new URL(h).origin + new URL(h).pathname))).toEqual(new Set([booking]));
    expect(hrefs.filter((h) => h.startsWith("tel:"))).not.toHaveLength(0);
    for (const h of hrefs.filter((x) => x.startsWith("tel:"))) expect(h).toBe("tel:2085550100");
    expect(JSON.stringify(vi.mocked(fetch).mock.calls)).not.toContain("book.example.com");
  });

  it("calls the primary booking action Book now in the header, hero, call to action and footer", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App salonUrl="http://fn.config-test.invalid/salon" bookingUrl={booking} />);
    await heading();
    const plain = screen.getAllByRole("link", { name: "Book now" });
    expect(plain.length).toBe(4);
    for (const l of plain) expect(l).toHaveAttribute("href", booking);
    expect(screen.queryByText(/Reserve Your Experience|Schedule Appointment|Book Online/)).toBeNull();
  });

  it("sends each service Book now to the booking page with that service id and keeps an existing query", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App salonUrl="http://fn.config-test.invalid/salon" bookingUrl={`${booking}?ref=hub`} />);
    await heading();
    const popular = screen.getByRole("region", { name: "Popular Services" });
    const manicure = within(popular).getByRole("link", { name: "Book now: Manicure" });
    const url = new URL(manicure.getAttribute("href")!);
    expect(url.origin + url.pathname).toBe(booking);
    expect(url.searchParams.get("service")).toBe("a");
    expect(url.searchParams.get("ref")).toBe("hub");
  });

  it("uses the same bookingUrl on the services page", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App salonUrl="http://fn.config-test.invalid/salon" bookingUrl={booking} path="/services" />);
    await screen.findByRole("heading", { level: 1, name: "Our Services" });
    const links = [...screen.getAllByRole("link", { name: /^Book now/ })];
    expect(links.length).toBe(5);
    const cards = links.filter((l) => /^Book now: /.test(l.getAttribute("aria-label") ?? ""));
    expect(cards).toHaveLength(3);
    expect(cards.map((l) => new URL(l.getAttribute("href")!).searchParams.get("service")).sort()).toEqual(["a", "b", "c"]);
    for (const l of links.filter((x) => !cards.includes(x))) expect(l).toHaveAttribute("href", booking);
  });

  it("shows the call line and no booking link when bookingUrl is missing, and still shows the data", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App salonUrl="http://fn.config-test.invalid/salon" />);
    await heading();
    expect(screen.queryByRole("link", { name: /^Book now/ })).toBeNull();
    expect(screen.getByText(/To book, call/)).toBeInTheDocument();
    expect(screen.getByText("Manicure")).toBeInTheDocument();
  });

  it("marks stale data and not fresh data", async () => {
    vi.stubGlobal("fetch", reply({ ...salon, stale: true }));
    const { unmount } = render(<App {...props} />);
    await heading();
    expect(screen.getByText(/may be a few minutes out of date/)).toBeInTheDocument();
    unmount();
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await heading();
    expect(screen.queryByText(/out of date/)).toBeNull();
  });
});

describe("the services page", () => {
  it("lists all services grouped by category, add-ons included", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} path="/services" />);
    expect(await screen.findByRole("heading", { level: 1, name: "Our Services" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Hands" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Feet" })).toBeInTheDocument();
    expect(screen.getByText("Gel polish").closest("div.rounded-xl")).toHaveTextContent("$10.50");
    expect(screen.getByText("Gel polish").closest("div.rounded-xl")).toHaveTextContent("Add-on");
    expect(screen.getAllByRole("link", { name: /^Book now: / })).toHaveLength(3);
  });

  it("hides Book now and shows the phone when online booking is off", async () => {
    vi.stubGlobal("fetch", reply({ ...salon, onlineBookingEnabled: false }));
    render(<App {...props} path="/services/" />);
    await screen.findByRole("heading", { level: 1, name: "Our Services" });
    expect(screen.queryByRole("link", { name: /^Book now: / })).toBeNull();
    expect(screen.getByText(/To book, call/)).toBeInTheDocument();
  });

  it("shows the error state with retry", async () => {
    vi.stubGlobal("fetch", reply({}, false));
    render(<App {...props} path="/services" />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
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

describe("the header, the mark and the first paint", () => {
  const booking = "https://booking.config-test.invalid/start";

  it("shows the salon mark made from the name, next to the name, in the header", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await heading();
    const header = screen.getByRole("banner");
    expect(within(header).getByTestId("salon-mark")).toHaveTextContent("TN");
    expect(within(header).getByText("Test Nails")).toBeInTheDocument();
  });

  it("puts one Book now pill in the header and no pill when booking is off", async () => {
    vi.stubGlobal("fetch", reply(salon));
    const { unmount } = render(<App salonUrl={props.salonUrl} bookingUrl={booking} />);
    await heading();
    expect(within(screen.getByRole("banner")).getByRole("link", { name: "Book now" })).toHaveAttribute("href", booking);
    unmount();
    vi.stubGlobal("fetch", reply({ ...salon, onlineBookingEnabled: false }));
    render(<App salonUrl={props.salonUrl} bookingUrl={booking} />);
    await heading();
    expect(within(screen.getByRole("banner")).queryByRole("link", { name: /Book now/ })).toBeNull();
  });

  it("starts with a skip link that points at the main landmark", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await heading();
    const skip = screen.getByRole("link", { name: "Skip to main content" });
    expect(skip).toHaveAttribute("href", "#main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
    expect(document.body.querySelector("a")).toBe(skip);
  });

  it("makes the touch targets at least 44px high: Book now buttons, footer links and the menu button", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} path="/services" />);
    await screen.findByRole("heading", { level: 1, name: "Our Services" });
    for (const l of screen.getAllByRole("link", { name: /^Book now/ })) expect(l.className).toContain("min-h-[44px]");
    const footer = within(screen.getByRole("contentinfo"));
    for (const l of [footer.getByRole("link", { name: "Services" }), footer.getByRole("link", { name: "(208) 555-0100" }), footer.getByRole("link", { name: "1 Main St, Boise, ID" })]) {
      expect(l.className).toContain("min-h-[44px]");
    }
    expect(screen.getByRole("button", { name: "Open menu" }).className).toContain("h-11");
  });

  it("shows the stat cards two across on a phone", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await heading();
    expect(screen.getByText("Services offered").closest("div.grid")).toHaveClass("grid-cols-2", "md:grid-cols-4");
  });

  it("uses a dark amber text on the category chip", async () => {
    vi.stubGlobal("fetch", reply(salon));
    render(<App {...props} />);
    await heading();
    const chip = within(screen.getByRole("region", { name: "Popular Services" })).getByText("Hands");
    expect(chip).toHaveClass("text-accent-ink");
    expect(chip).not.toHaveClass("text-accent");
  });
});
