import { DAY_NAME, formatRange, mapHref, telHref, weekFromMonday } from "../lib/format";
import type { Day, Salon } from "../lib/salon";

export interface SiteFooterProps {
  salon: Salon;
  today: Day;
  tagline: string;
  canBook: boolean;
  bookingUrl?: string;
  year: number;
}

export function SiteFooter({ salon, today, tagline, canBook, bookingUrl, year }: SiteFooterProps) {
  const phone = salon.phone.trim();
  const address = salon.address.trim();
  const todayHours = salon.hours.find((h) => h.day === today);
  const link = "flex min-h-[44px] items-center text-ink-muted transition-colors hover:text-brand";
  const inline = "inline-flex min-h-[44px] items-center transition-colors hover:text-brand";
  return (
    <footer className="border-t border-line bg-surface px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="mb-4 text-2xl font-light text-ink">{salon.name}</h3>
            {tagline ? <p className="max-w-md text-ink-muted">{tagline}</p> : null}
          </div>
          <div>
            <h4 className="mb-4 font-medium text-ink">Quick Links</h4>
            <div>
              <a href="/services" className={link}>
                Services
              </a>
              {canBook ? (
                <a href={bookingUrl} className={link}>
                  Book now
                </a>
              ) : null}
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-medium text-ink">Contact</h4>
            <div className="text-sm text-ink-muted">
              {address ? (
                <p>
                  <a href={mapHref(address)} target="_blank" rel="noopener noreferrer" className={inline}>
                    {address}
                  </a>
                </p>
              ) : null}
              {phone ? (
                <p>
                  <a href={telHref(phone)} className={inline}>
                    {phone}
                  </a>
                </p>
              ) : null}
              {todayHours ? (
                <p>
                  Today, {DAY_NAME[today]}: {formatRange(todayHours)}
                </p>
              ) : null}
              {!address && !phone ? <p className="italic">Contact details are not listed yet.</p> : null}
            </div>
          </div>
        </div>
        <details className="mt-8 text-sm text-ink-muted">
          <summary className="cursor-pointer">All opening hours</summary>
          <ul className="mt-2 max-w-xs">
            {weekFromMonday(salon.hours).map((h) => (
              <li key={h.day} className="flex justify-between gap-4 py-1">
                <span>{DAY_NAME[h.day]}</span>
                <span>{formatRange(h)}</span>
              </li>
            ))}
          </ul>
        </details>
        <div className="mt-8 border-t border-line pt-8 text-center">
          <p className="text-sm text-ink-muted">
            © {year} {salon.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
