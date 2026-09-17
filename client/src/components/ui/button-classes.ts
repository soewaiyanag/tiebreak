import { cn } from "../../lib/cn";

type Variant = "primary" | "affirmative" | "secondary";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-tangerine-deep text-cream-bright shadow-[var(--shadow-press-tangerine)] hover:brightness-105 active:translate-y-px",
  affirmative:
    "bg-teal text-cream-bright shadow-[var(--shadow-press-teal)] hover:brightness-105 active:translate-y-px",
  secondary:
    "border-[length:var(--border-chip)] border-cocoa bg-transparent text-cocoa hover:bg-cream-deep active:translate-y-px",
};

/** Shared with any element that needs to *look* like a button but isn't one — e.g. a nav `<Link>`. */
export function buttonClasses(variant: Variant = "secondary", className?: string): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-body text-sm font-bold transition-[filter,transform] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0",
    VARIANT_CLASSES[variant],
    className,
  );
}

export type { Variant as ButtonVariant };
