import { monogram } from "../lib/booking";

/** The salon's mark: its initials on the brand colour, as on the booking page. */
export function SalonMark({ name, className = "h-10 w-10 text-base" }: { name: string; className?: string }) {
  return (
    <span data-testid="salon-mark" aria-hidden="true" className={`inline-grid shrink-0 place-items-center rounded-xl bg-brand font-extrabold tracking-wide text-white ${className}`}>
      {monogram(name)}
    </span>
  );
}
