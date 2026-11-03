import { telHref } from "../lib/format";
import type { Contact } from "../lib/salon";

export function Loading() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center" role="status" aria-live="polite">
      <p className="text-lg text-ink-soft">Loading salon details...</p>
    </main>
  );
}

export function LoadError({ contact, onRetry }: { contact: Contact | null; onRetry: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">We could not load the salon details</h1>
      <p role="alert" className="mt-3 text-ink-soft">
        Please try again in a moment.
      </p>
      {contact ? (
        <p className="mt-4 text-lg">
          {contact.name}: call{" "}
          <a href={telHref(contact.phone)} className="font-semibold text-brand underline">
            {contact.phone}
          </a>
        </p>
      ) : null}
      <button type="button" onClick={onRetry} className="mt-6 rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-hover">
        Try again
      </button>
    </main>
  );
}
