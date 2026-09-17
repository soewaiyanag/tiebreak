export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:border-[length:var(--border-card)] focus:border-cocoa focus:bg-card focus:px-4 focus:py-2 focus:font-body focus:text-sm focus:font-bold focus:text-cocoa"
    >
      Skip to content
    </a>
  );
}
