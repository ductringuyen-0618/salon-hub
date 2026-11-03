import { Menu, X } from "lucide-react";
import { useState } from "react";
import { SalonMark } from "./Logo";

const LINKS = [
  { label: "Home", href: "/", key: "home" },
  { label: "Services", href: "/services", key: "services" },
] as const;

const pill =
  "inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-hover";

export function SiteHeader({ name, tagline, active, bookingUrl }: { name: string; tagline: string; active: "home" | "services"; bookingUrl?: string }) {
  const [open, setOpen] = useState(false);
  const cls = (key: string) => `inline-flex min-h-[44px] items-center font-light tracking-wide transition-colors hover:text-brand ${active === key ? "text-brand" : "text-ink"}`;
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:font-medium focus:text-brand focus:shadow-lg"
      >
        Skip to main content
      </a>
      <header className="relative border-b border-line bg-surface shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-4 sm:py-6">
            <a href="/" className="flex min-w-0 items-center gap-3">
              <SalonMark name={name} />
              <span className="min-w-0">
                <span className="block break-words text-lg font-light leading-tight tracking-wide text-ink transition-colors hover:text-brand sm:text-xl md:text-2xl lg:text-3xl">{name}</span>
                {tagline ? <span className="mt-1 hidden text-xs font-light tracking-wider text-ink-muted sm:block sm:text-sm">{tagline}</span> : null}
              </span>
            </a>
            <div className="flex shrink-0 items-center gap-3 sm:gap-6">
              <nav aria-label="Main" className="hidden items-center space-x-8 lg:flex">
                {LINKS.map((l) => (
                  <a key={l.key} href={l.href} className={cls(l.key)} aria-current={active === l.key ? "page" : undefined}>
                    {l.label}
                  </a>
                ))}
              </nav>
              {bookingUrl ? (
                <a href={bookingUrl} className={pill}>
                  Book now
                </a>
              ) : null}
              <button
                type="button"
                className="inline-grid h-11 w-11 place-items-center rounded-md text-ink transition-colors hover:bg-brand/10 hover:text-brand lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen(!open)}
              >
                {open ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
              </button>
            </div>
          </div>
          {open ? (
            <nav aria-label="Mobile" className="absolute left-0 right-0 top-full z-50 border-b border-line bg-surface px-4 py-4 shadow-lg lg:hidden">
              {LINKS.map((l) => (
                <a key={l.key} href={l.href} className={`flex ${cls(l.key)}`} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </header>
    </>
  );
}
