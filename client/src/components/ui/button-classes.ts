import { cn } from "../../lib/cn";

type Variant = "primary" | "affirmative" | "secondary";

/**
 * Buttons are game pieces (see .piece in globals.css): an ink outline, a
 * cocoa base edge, a lift on hover, a sink on press and a spring on release.
 * Filled variants keep the brand kit's pressed-plastic inset on top. The
 * outlined secondary variant sits on a thinner edge, because it is never the
 * screen's one tangerine or teal moment.
 */
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-tangerine-deep text-cream-bright [--inset:var(--shadow-press-tangerine)]",
  affirmative: "bg-teal text-cream-bright [--inset:var(--shadow-press-teal)]",
  secondary: "piece-chip bg-card text-cocoa hover:bg-cream-deep",
};

/** Shared with any element that needs to *look* like a button but isn't one — e.g. a nav `<Link>`. */
export function buttonClasses(variant: Variant = "secondary", className?: string): string {
  return cn(
    "piece inline-flex items-center justify-center gap-2 rounded-full border-2 border-cocoa px-5 py-2.5 font-display text-base font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    VARIANT_CLASSES[variant],
    className,
  );
}

export type { Variant as ButtonVariant };
