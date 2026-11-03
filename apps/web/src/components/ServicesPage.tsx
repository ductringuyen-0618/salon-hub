import { useEffect } from "react";
import { telHref, todayIn, groupByCategory } from "../lib/format";
import type { Salon } from "../lib/salon";
import { siteCopy as defaultCopy, type SiteCopy } from "../siteCopy";
import { ServiceCard } from "./ServiceCard";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export interface ServicesPageProps {
  salon: Salon;
  bookingUrl?: string;
  now?: Date;
  copy?: SiteCopy;
}

export function ServicesPage({ salon, bookingUrl, now, copy = defaultCopy }: ServicesPageProps) {
  useEffect(() => {
    document.title = `Services | ${salon.name}`;
  }, [salon.name]);

  const today = todayIn(salon.salonTimeZone, now);
  const canBook = salon.onlineBookingEnabled && Boolean(bookingUrl);
  const phone = salon.phone.trim();
  const groups = groupByCategory(salon.services);

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader name={salon.name} tagline={copy.tagline} active="services" />
      <main className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-light text-ink md:text-5xl">Our Services</h1>
            <p className="mx-auto max-w-2xl text-xl text-ink-muted">Every service with its price and time. Prices are starting prices.</p>
            {!canBook && phone ? (
              <p className="mt-4 text-lg text-ink-muted">
                To book, call{" "}
                <a href={telHref(phone)} className="font-semibold text-brand underline">
                  {phone}
                </a>
              </p>
            ) : null}
          </div>
          {groups.length === 0 ? <p className="text-center text-ink-muted">No services are listed yet.</p> : null}
          {groups.map((g) => (
            <section key={g.category} aria-labelledby={`cat-${g.category}`} className="mb-12">
              <h2 id={`cat-${g.category}`} className="mb-6 text-3xl font-light capitalize text-ink">
                {g.category}
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {g.items.map((s) => (
                  <ServiceCard key={s.serviceRef} service={s} bookingUrl={canBook ? bookingUrl : undefined} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter salon={salon} today={today} tagline={copy.tagline} canBook={canBook} bookingUrl={bookingUrl} year={(now ?? new Date()).getFullYear()} />
    </div>
  );
}
