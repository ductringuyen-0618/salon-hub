export type Day = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type Hours = { day: Day; open: string; close: string } | { day: Day; closed: true };
export interface ServiceItem {
  serviceRef: string;
  name: string;
  category: string;
  kind: "service" | "addon";
  durationMin: number;
  fromPriceCents: number;
}
export interface Salon {
  contractVersion: "1";
  name: string;
  phone: string;
  address: string;
  salonTimeZone: string;
  onlineBookingEnabled: boolean;
  hours: Hours[];
  services: ServiceItem[];
  leadTimeMin: number;
  maxDaysAhead: number;
  maxGuests: number;
}

const DAYS: readonly string[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): v is string => typeof v === "string";
const nat = (v: unknown, min: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= min;

function hours(v: unknown): Hours | null {
  if (!isRec(v) || !str(v.day) || !DAYS.includes(v.day)) return null;
  const day = v.day as Day;
  if (v.closed === true) return { day, closed: true };
  if (str(v.open) && str(v.close) && CLOCK.test(v.open) && CLOCK.test(v.close)) return { day, open: v.open, close: v.close };
  return null;
}

function service(v: unknown): ServiceItem | null {
  if (!isRec(v)) return null;
  const { serviceRef, name, category, kind, durationMin, fromPriceCents } = v;
  if (!str(serviceRef) || !str(name) || !str(category) || (kind !== "service" && kind !== "addon")) return null;
  if (!nat(durationMin, 1) || !nat(fromPriceCents, 0)) return null;
  return { serviceRef, name, category, kind, durationMin, fromPriceCents };
}

/** Copies only the contract fields. Unknown fields are dropped, a wrong shape returns null. */
export function parseSalon(v: unknown): Salon | null {
  if (!isRec(v) || v.contractVersion !== "1") return null;
  const { name, phone, address, salonTimeZone, onlineBookingEnabled, leadTimeMin, maxDaysAhead, maxGuests } = v;
  if (!str(name) || !str(phone) || !str(address) || !str(salonTimeZone) || typeof onlineBookingEnabled !== "boolean") return null;
  if (!nat(leadTimeMin, 0) || !nat(maxDaysAhead, 0) || !nat(maxGuests, 0)) return null;
  if (!Array.isArray(v.hours) || v.hours.length !== 7 || !Array.isArray(v.services)) return null;
  const hs = v.hours.map(hours);
  const ss = v.services.map(service);
  if (hs.some((h) => h === null) || ss.some((s) => s === null)) return null;
  return {
    contractVersion: "1",
    name,
    phone,
    address,
    salonTimeZone,
    onlineBookingEnabled,
    hours: hs as Hours[],
    services: ss as ServiceItem[],
    leadTimeMin,
    maxDaysAhead,
    maxGuests,
  };
}
