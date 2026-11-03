import { formatClock, formatPrice } from "./format";
import type { Day, Hours, Salon, ServiceItem } from "./salon";

const FEATURED = 4;

export function featuredServices(services: ServiceItem[], count = FEATURED): ServiceItem[] {
  const base = services.filter((s) => s.kind === "service");
  const tops = new Map<string, ServiceItem>();
  for (const s of base) {
    const best = tops.get(s.category);
    if (!best || s.fromPriceCents > best.fromPriceCents) tops.set(s.category, s);
  }
  const picked = [...tops.values()].slice(0, count);
  const rest = base.filter((s) => !picked.includes(s)).sort((a, b) => b.fromPriceCents - a.fromPriceCents);
  return [...picked, ...rest].slice(0, count);
}

function shortClock(hhmm: string): string {
  return formatClock(hhmm).replace(":00", "");
}

export function shortRange(h: Hours): string {
  return "closed" in h ? "Closed" : `${shortClock(h.open)} to ${shortClock(h.close)}`;
}

export function cityOf(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  return parts.length >= 3 ? (parts[parts.length - 2] ?? "") : "";
}

export interface Stat {
  label: string;
  value: string;
  icon?: "sparkles" | "tag" | "clock" | "pin";
}

export function homeStats(salon: Salon, today: Day, owned: Array<{ label: string; value: string }>): Stat[] {
  if (owned.length > 0) return owned.slice(0, 4);
  const stats: Stat[] = [];
  const offered = salon.services.filter((s) => s.kind === "service");
  if (offered.length > 0) {
    stats.push({ label: "Services offered", value: String(offered.length), icon: "sparkles" });
    stats.push({ label: "Prices start at", value: formatPrice(Math.min(...offered.map((s) => s.fromPriceCents))), icon: "tag" });
  }
  const todayHours = salon.hours.find((h) => h.day === today);
  if (todayHours) stats.push({ label: "Open today", value: shortRange(todayHours), icon: "clock" });
  const city = cityOf(salon.address);
  if (city) stats.push({ label: "Find us in", value: city, icon: "pin" });
  return stats;
}
