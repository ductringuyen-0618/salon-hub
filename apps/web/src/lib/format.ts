import type { Day, Hours, ServiceItem } from "./salon";

export const DAY_ORDER: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_NAME: Record<Day, string> = { sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };
const JS_DAYS: Day[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function formatPrice(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rest = cents % 100;
  return rest === 0 ? `$${dollars}` : `$${dollars}.${String(rest).padStart(2, "0")}`;
}

export function formatClock(hhmm: string): string {
  const [h = "0", m = "00"] = hhmm.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 === 0 ? 12 : hour % 12}:${m} ${suffix}`;
}

export function formatRange(h: Hours): string {
  return "closed" in h ? "Closed" : `${formatClock(h.open)} to ${formatClock(h.close)}`;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function todayIn(timeZone: string, now: Date = new Date()): Day {
  try {
    const name = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(now).toLowerCase().slice(0, 3);
    return JS_DAYS.find((d) => d === name) ?? JS_DAYS[now.getDay()]!;
  } catch {
    return JS_DAYS[now.getDay()]!;
  }
}

export function weekFromMonday(hours: Hours[]): Hours[] {
  return DAY_ORDER.map((d) => hours.find((h) => h.day === d)).filter((h): h is Hours => h !== undefined);
}

export function groupByCategory(services: ServiceItem[]): Array<{ category: string; items: ServiceItem[] }> {
  const groups = new Map<string, ServiceItem[]>();
  for (const s of services) groups.set(s.category, [...(groups.get(s.category) ?? []), s]);
  return [...groups].map(([category, items]) => ({ category, items }));
}

export const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, "")}`;
export const mapHref = (address: string): string => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
