import { ArrowRight, Calendar, Phone, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { telHref, todayIn } from "../lib/format";
import { featuredServices, homeStats } from "../lib/home";
import type { Salon } from "../lib/salon";
import { siteCopy as defaultCopy, type SiteCopy } from "../siteCopy";
import { ServiceCard } from "./ServiceCard";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { Badge, Card, Icon, btnOutline, btnPrimary } from "./ui";

export interface HomeProps {
  salon: Salon;
  bookingUrl?: string;
  now?: Date;
  copy?: SiteCopy;
}

export function Home({ salon, bookingUrl, now, copy = defaultCopy }: HomeProps) {
  useEffect(() => {
    document.title = salon.name;
    document.querySelector('meta[name="description"]')?.setAttribute("content", `${salon.name}, ${salon.address}. Hours, services and online booking.`);
  }, [salon.name, salon.address]);

  const today = todayIn(salon.salonTimeZone, now);
  const canBook = salon.onlineBookingEnabled && Boolean(bookingUrl);
  const phone = salon.phone.trim();
  const stats = homeStats(salon, today, copy.stats);
  const featured = featuredServices(salon.services);
  const year = (now ?? new Date()).getFullYear();

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader name={salon.name} tagline={copy.tagline} active="home" bookingUrl={canBook ? bookingUrl : undefined} />

      <main id="main" tabIndex={-1} className="outline-none">
        <section aria-labelledby="hero" className="px-4 py-20">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-8">
              <Badge className="mb-6 border-brand/20 bg-brand/10 text-brand">{copy.hero.badge}</Badge>
              <h1 id="hero" className="mb-6 text-4xl font-light leading-tight text-ink md:text-6xl lg:text-7xl">
                <span className="sr-only">{salon.name}. </span>
                <span className="block">{copy.hero.titleTop}</span>
                <span className="block font-light italic text-brand">{copy.hero.titleAccent}</span>
              </h1>
              <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-ink-muted">{copy.hero.intro}</p>
            </div>

            <div className="mb-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
              {canBook ? (
                <a href={bookingUrl} className={btnPrimary}>
                  {copy.hero.primary}
                  <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </a>
              ) : null}
              {phone ? (
                <a href={telHref(phone)} className={btnOutline}>
                  {copy.hero.secondary}
                  <Phone aria-hidden="true" className="h-5 w-5" />
                </a>
              ) : null}
            </div>
            {!canBook && phone ? (
              <p className="-mt-8 mb-16 text-lg text-ink-muted">
                To book, call{" "}
                <a href={telHref(phone)} className="font-semibold text-brand underline">
                  {phone}
                </a>
              </p>
            ) : null}

            {stats.length > 0 ? (
              <div className="mb-20 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                {stats.map((stat) => (
                  <Card key={stat.label} className="hover:shadow-md">
                    <div className="p-4 text-center sm:p-6">
                      {stat.icon ? (
                        <div className="mb-3 flex justify-center text-brand">
                          <Icon name={stat.icon} className="h-6 w-6" />
                        </div>
                      ) : null}
                      <div className="mb-1 text-2xl font-semibold text-ink">{stat.value}</div>
                      <div className="text-sm text-ink-muted">{stat.label}</div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="why" className="bg-surface px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 id="why" className="mb-4 text-4xl font-light text-ink">
                {copy.why.title} {salon.name}
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-ink-muted">{copy.why.intro}</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {copy.why.cards.map((card) => (
                <Card key={card.title} className="bg-paper hover:-translate-y-1 hover:shadow-lg">
                  <div className="p-8 text-center">
                    <div className="mb-4 flex justify-center text-brand">
                      <Icon name={card.icon} className="h-8 w-8" />
                    </div>
                    <h3 className="mb-3 text-xl font-medium text-ink">{card.title}</h3>
                    <p className="leading-relaxed text-ink-muted">{card.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="popular" className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 id="popular" className="mb-4 text-4xl font-light text-ink">
                {copy.services.title}
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-ink-muted">{copy.services.intro}</p>
            </div>
            {featured.length === 0 ? <p className="text-center text-ink-muted">No services are listed yet.</p> : null}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {featured.map((s) => (
                <ServiceCard key={s.serviceRef} service={s} bookingUrl={canBook ? bookingUrl : undefined} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <a href="/services" className="mx-auto inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3 font-medium text-white transition-all duration-300 hover:bg-brand-hover">
                {copy.services.viewAll}
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        <section aria-labelledby="cta" className="bg-gradient-to-r from-brand/5 to-accent/5 px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="rounded-3xl border border-line bg-surface p-8 shadow-lg sm:p-12">
              <Sparkles aria-hidden="true" className="mx-auto mb-6 h-16 w-16 text-brand" />
              <h2 id="cta" className="mb-4 text-3xl font-light text-ink">
                {copy.cta.title}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-ink-muted">{copy.cta.text}</p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                {canBook ? (
                  <a href={bookingUrl} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-3 text-lg font-medium text-white transition-all duration-300 hover:bg-brand-hover">
                    <Calendar aria-hidden="true" className="h-5 w-5" />
                    {copy.cta.primary}
                  </a>
                ) : null}
                <a href="/services" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-line px-8 py-3 text-lg font-medium text-ink transition-all duration-300 hover:border-brand hover:text-brand">
                  <Sparkles aria-hidden="true" className="h-5 w-5" />
                  {copy.cta.secondary}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter salon={salon} today={today} tagline={copy.tagline} canBook={canBook} bookingUrl={bookingUrl} year={year} />
    </div>
  );
}
