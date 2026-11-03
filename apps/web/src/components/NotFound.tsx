export function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-ink-soft">There is nothing at this address.</p>
      <a href="/" className="mt-6 inline-block rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-hover">
        Go to the home page
      </a>
    </main>
  );
}
