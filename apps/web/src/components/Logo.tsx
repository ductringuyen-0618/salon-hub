export function Logo({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold text-brand">
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8">
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <path d="M16 6c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" fill="#fff" />
      </svg>
      <span className="text-lg">{name}</span>
    </span>
  );
}
