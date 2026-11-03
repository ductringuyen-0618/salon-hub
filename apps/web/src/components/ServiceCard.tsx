import { Clock } from "lucide-react";
import { formatDuration, formatPrice } from "../lib/format";
import type { ServiceItem } from "../lib/salon";
import { Badge, Card, btnSmall } from "./ui";

export function ServiceCard({ service, bookingUrl }: { service: ServiceItem; bookingUrl?: string }) {
  return (
    <Card className="hover:shadow-lg">
      <div className="flex items-start justify-between gap-4 p-6 sm:p-8">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="break-words text-xl font-medium text-ink">{service.name}</h3>
            <Badge className="border-accent/30 bg-accent/20 capitalize text-accent">{service.kind === "addon" ? "Add-on" : service.category}</Badge>
          </div>
          <span className="flex items-center gap-1 text-sm text-ink-muted">
            <Clock aria-hidden="true" className="h-4 w-4" />
            {formatDuration(service.durationMin)}
          </span>
        </div>
        <div className="ml-4 shrink-0 text-right">
          <div className="mb-2 text-2xl font-semibold text-brand">{formatPrice(service.fromPriceCents)}</div>
          {bookingUrl ? (
            <a href={bookingUrl} className={btnSmall} aria-label={`Book Now: ${service.name}`}>
              Book Now
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
