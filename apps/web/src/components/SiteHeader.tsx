import { Menu, X } from "lucide-react";
import { useState } from "react";

const LINKS = [
  { label: "Home", href: "/", key: "home" },
  { label: "Services", href: "/services", key: "services" },
] as const;

export function SiteHeader({ name, tagline, active }: { name: string; tagline: string; active: "home" | "services" }) {
  const [open, setOpen] = useState(false);
  const cls = (key: string) => `py-2 font-light tracking-wide transition-colors hover:text-brand ${active === key ? "text-brand" : "text-ink"}`;
  return (
    <header className="relative border-b border-line bg-surface shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <a href="/" className="min-w-0">
            <span className="block break-words text-lg font-light tracking-wide text-ink transition-colors hover:text-brand sm:text-xl md:text-2xl lg:text-3xl">{name}</span>
            {tagline ? <span className="mt-1 block text-xs font-light tracking-wider text-ink-muted sm:text-sm">{tagline}</span> : null}
          </a>
          <nav aria-label="Main" className="hidden items-center space-x-8 lg:flex">
            {LINKS.map((l) => (
              <a key={l.key} href={l.href} className={cls(l.key)} aria-current={active === l.key ? "page" : undefined}>
                {l.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="rounded-md p-2 text-ink transition-colors hover:bg-brand/10 hover:text-brand lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X aria-hidden="true" className="h-6 w-6" /> : <Menu aria-hidden="true" className="h-6 w-6" />}
          </button>
        </div>
        {open ? (
          <nav aria-label="Mobile" className="absolute left-0 right-0 top-full z-50 space-y-2 border-b border-line bg-surface px-4 py-6 shadow-lg lg:hidden">
            {LINKS.map((l) => (
              <a key={l.key} href={l.href} className={`block ${cls(l.key)}`} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
