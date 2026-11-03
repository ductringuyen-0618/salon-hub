import type { HTMLAttributes, ReactNode } from "react";
import { Calendar, Clock, Heart, MapPin, Sparkles, Tag, Users } from "lucide-react";
import type { CopyIcon } from "../siteCopy";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand px-10 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-brand-hover hover:shadow-xl";
export const btnOutline =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-line px-10 py-4 text-lg font-medium text-ink transition-all duration-300 hover:border-brand hover:text-brand";
export const btnSmall =
  "inline-flex items-center justify-center min-h-[44px] whitespace-nowrap rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-hover";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border border-line bg-surface shadow-sm transition-shadow duration-300 ${className}`} {...props} />;
}

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${className}`} {...props} />;
}

const ICONS = { sparkles: Sparkles, heart: Heart, users: Users, calendar: Calendar, tag: Tag, clock: Clock, pin: MapPin };

export function Icon({ name, className }: { name: CopyIcon | "pin"; className: string }): ReactNode {
  const Cmp = ICONS[name];
  return <Cmp aria-hidden="true" className={className} />;
}
