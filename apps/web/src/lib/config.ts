/**
 * Where the site finds its two outside addresses. Read at run time from /config.json so the owner can change them after
 * deployment without a rebuild. There is no built in host: a missing address means that feature is shown as not set up.
 */
export interface RuntimeConfig {
  /** The salon function: the one fetch for the salon's data. */
  salonUrl?: string;
  /** The POS online booking page: every Book Now leaves for it. */
  bookingUrl?: string;
  /** This site's own address. Optional. */
  siteUrl?: string;
}

export interface BuildEnv {
  salonUrl?: string;
  bookingUrl?: string;
}

/** The address as the owner wrote it, trimmed, when it is an absolute http or https URL. Anything else is ignored. */
export function cleanUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (v === "") return undefined;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? v : undefined;
  } catch {
    return undefined;
  }
}

const isRec = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** The file wins over the build time variables, one field at a time. */
export function resolveConfig(file: unknown, env: BuildEnv): RuntimeConfig {
  const f = isRec(file) ? file : {};
  const out: RuntimeConfig = {};
  const salonUrl = cleanUrl(f.salonUrl) ?? cleanUrl(env.salonUrl);
  const bookingUrl = cleanUrl(f.bookingUrl) ?? cleanUrl(env.bookingUrl);
  const siteUrl = cleanUrl(f.siteUrl);
  if (salonUrl) out.salonUrl = salonUrl;
  if (bookingUrl) out.bookingUrl = bookingUrl;
  if (siteUrl) out.siteUrl = siteUrl;
  return out;
}

export const buildEnv = (): BuildEnv => ({ salonUrl: import.meta.env.VITE_SALON_URL, bookingUrl: import.meta.env.VITE_BOOKING_URL });

export async function loadConfig(env: BuildEnv = buildEnv()): Promise<RuntimeConfig> {
  let file: unknown = null;
  try {
    const res = await fetch("/config.json", { cache: "no-store", headers: { accept: "application/json" } });
    if (res.ok) file = await res.json();
  } catch {
    // no file, an HTML page in its place, or no network: the variables still apply
  }
  return resolveConfig(file, env);
}
