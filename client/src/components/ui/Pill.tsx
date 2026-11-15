import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Tone = "butter" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  butter: "bg-tint-butter-soft",
  neutral: "bg-cream-deep",
};

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/**
 * A small label in the same sticker style as StatusSticker (ink outline,
 * sentence case), minus the tilt: it's a note on the card, not the poll's status.
 */
export function Pill({ tone = "neutral", className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[length:var(--radius-md)] border-2 border-cocoa px-2.5 py-1 font-display text-sm font-bold text-cocoa",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
