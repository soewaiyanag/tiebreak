/** guidance/brand-kit.md "App Favicon": a tangerine circle, cocoa ring, cream check. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="12.5" fill="var(--color-tangerine)" stroke="var(--color-cocoa)" strokeWidth="2.4" />
        <path
          d="M8.5 14.5l3.5 3.5 7.5-8"
          fill="none"
          stroke="var(--color-cream-bright)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-md font-black text-cocoa">tiebreak</span>
    </span>
  );
}
