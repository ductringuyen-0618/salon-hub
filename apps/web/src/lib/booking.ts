/** The booking page address with the chosen service added. An existing query and hash stay. */
export function bookingHref(bookingUrl: string, serviceId: string | undefined): string {
  if (!serviceId) return bookingUrl;
  try {
    const url = new URL(bookingUrl);
    url.searchParams.set("service", serviceId);
    return url.toString();
  } catch {
    return bookingUrl;
  }
}

/** One or two capitals for the mark. "5 Nails & Spa" is "5N". */
export function monogram(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter((w) => w !== "")
    .slice(0, 2)
    .map((w) => [...w][0]!.toUpperCase());
  return letters.join("") || "S";
}
