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
  name: string;
  phone: string;
  address: string;
  salonTimeZone: string;
  onlineBookingEnabled: boolean;
  hours: Hours[];
  services: ServiceItem[];
}

const KEEP = "salon-hub:last-contact";

export interface Contact {
  name: string;
  phone: string;
}

export async function fetchSalon(url: string, signal?: AbortSignal): Promise<Salon> {
  const res = await fetch(url, { signal, headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`salon ${res.status}`);
  const data = (await res.json()) as Partial<Salon>;
  if (typeof data.name !== "string" || typeof data.phone !== "string" || typeof data.address !== "string" || !Array.isArray(data.hours) || !Array.isArray(data.services)) {
    throw new Error("salon bad shape");
  }
  return data as Salon;
}

export function rememberContact(salon: Salon): void {
  try {
    localStorage.setItem(KEEP, JSON.stringify({ name: salon.name, phone: salon.phone }));
  } catch {
    /* storage unavailable */
  }
}

export function recallContact(): Contact | null {
  try {
    const raw = localStorage.getItem(KEEP);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Contact>;
    return typeof v.name === "string" && typeof v.phone === "string" ? { name: v.name, phone: v.phone } : null;
  } catch {
    return null;
  }
}
