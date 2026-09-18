import { cn } from "../../lib/cn";

type Variant = "primary" | "affirmative" | "secondary";

/**
 * Pressed-plastic: filled buttons give ~1.5px under the finger on :active,
 * riding on top of the inset shadow tokens (guidance/brand-kit.md "Print
 * finish"). A small hover lift on the two filled variants gives them the
 * "game piece" feel the brand kit describes; the outlined secondary variant
 * stays calmer on purpose — it's never the screen's one tangerine/teal moment.
 */
const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-tangerine-deep text-cream-bright shadow-[var(--shadow-press-tangerine)] hover:brightness-110 hover:scale-[1.02] active:translate-y-[1.5px] active:scale-100 active:brightness-95",
  affirmative:
    "bg-teal text-cream-bright shadow-[var(--shadow-press-teal)] hover:brightness-110 hover:scale-[1.02] active:translate-y-[1.5px] active:scale-100 active:brightness-95",
  secondary:
    "border-[length:var(--border-chip)] border-cocoa bg-transparent text-cocoa hover:bg-cream-deep active:translate-y-[1.5px]",
};

/** Shared with any element that needs to *look* like a button but isn't one — e.g. a nav `<Link>`. */
export function buttonClasses(variant: Variant = "secondary", className?: string): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-body text-sm font-bold transition-[filter,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:brightness-100 disabled:active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:translate-y-0",
    VARIANT_CLASSES[variant],
    className,
  );
}

export type { Variant as ButtonVariant };
