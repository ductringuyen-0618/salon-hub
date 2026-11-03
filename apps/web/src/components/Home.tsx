import { useEffect } from "react";
import { DAY_NAME, formatDuration, formatPrice, formatRange, groupByCategory, mapHref, telHref, todayIn, weekFromMonday } from "../lib/format";
import type { Salon } from "../lib/salon";
import { Logo } from "./Logo";

export interface HomeProps {
  salon: Salon;
  bookingUrl?: string;
  now?: Date;
}

export function Home({ salon, bookingUrl, now }: HomeProps) {
  useEffect(() => {
    document.title = salon.name;
    document.querySelector('meta[name="description"]')?.setAttribute("content", `${salon.name}, ${salon.address}. Hours, services and online booking.`);
  }, [salon.name, salon.address]);

  const today = todayIn(salon.salonTimeZone, now);
  const week = weekFromMonday(salon.hours);
  const todayHours = salon.hours.find((h) => h.day === today);
  const canBook = salon.onlineBookingEnabled && Boolean(bookingUrl);
  const groups = groupByCategory(salon.services);

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Logo name={salon.name} />
          <a href={telHref(salon.phone)} className="font-medium text-brand hover:text-brand-hover">
            {salon.phone}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section aria-labelledby="hero" className="rounded-xl bg-brand-soft p-6 sm:p-10">
          <h1 id="hero" className="break-words text-3xl font-bold text-brand-dark sm:text-4xl">
            {salon.name}
          </h1>
          {todayHours ? (
            <p className="mt-2 text-ink-soft">
              Today, {DAY_NAME[today]}: <span className="font-medium text-ink">{formatRange(todayHours)}</span>
            </p>
          ) : null}
          <div className="mt-6">
            {canBook ? (
              <a href={bookingUrl} className="inline-block rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-white hover:bg-brand-hover">
                Book now
              </a>
            ) : (
              <p className="text-lg">
                To book, call{" "}
                <a href={telHref(salon.phone)} className="font-semibold text-brand underline">
                  {salon.phone}
                </a>
              </p>
            )}
          </div>
        </section>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section aria-labelledby="visit" className="rounded-xl border border-line bg-white p-6">
            <h2 id="visit" className="text-xl font-semibold">
              Visit
            </h2>
            <p className="mt-3 break-words">{salon.address}</p>
            <a href={mapHref(salon.address)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-medium text-brand hover:text-brand-hover">
              View on map
            </a>
            <p className="mt-4">
              <a href={telHref(salon.phone)} className="font-medium text-brand hover:text-brand-hover">
                Call {salon.phone}
              </a>
            </p>
          </section>

          <section aria-labelledby="hours" className="rounded-xl border border-line bg-white p-6">
            <h2 id="hours" className="text-xl font-semibold">
              Hours
            </h2>
            <ul className="mt-3 divide-y divide-line">
              {week.map((h) => (
                <li key={h.day} className={`flex justify-between gap-4 py-2 ${h.day === today ? "font-semibold text-brand-dark" : ""}`}>
                  <span>{DAY_NAME[h.day]}</span>
                  <span>{formatRange(h)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="services" className="mt-8">
          <h2 id="services" className="text-2xl font-semibold">
            Services
          </h2>
          {groups.length === 0 ? <p className="mt-3 text-ink-soft">No services are listed yet.</p> : null}
          {groups.map((g) => (
            <div key={g.category} className="mt-6">
              <h3 className="text-lg font-semibold text-brand-dark">{g.category}</h3>
              <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-white">
                {g.items.map((s) => (
                  <li key={s.serviceRef} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
                    <span className="min-w-0 break-words font-medium">
                      {s.name}
                      {s.kind === "addon" ? <span className="ml-2 rounded bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-dark">Add-on</span> : null}
                    </span>
                    <span className="text-ink-soft">
                      {formatDuration(s.durationMin)}, from <span className="font-semibold text-ink">{formatPrice(s.fromPriceCents)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
