import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Tone = "teal" | "butter" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  teal: "bg-teal-soft text-teal-deep",
  butter: "bg-tint-butter-soft text-cocoa",
  neutral: "bg-cream-deep text-cocoa-soft",
};

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** Status is always words plus color (guidance/accessibility.md) — the dot/icon before children carries no meaning alone. */
export function Pill({ tone = "neutral", className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-xs font-extrabold uppercase tracking-[0.06em]",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
