import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface InkChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  picked: boolean;
  /** Content layout (flex, alignment, padding), applied to both the paper layer and the ink layer so they line up exactly. */
  layout: string;
}

/**
 * A game-piece chip that gets inked in when picked: cocoa ink floods it
 * from the exact point you tapped (a clip-path wipe, which reads as
 * cause and effect better than a fade) and the text flips to cream as the ink passes over it.
 * The ink layer is a second copy of the content, clipped, so the flip
 * happens under the edge of the ink rather than all at once. Keyboard picks
 * ink from the center.
 */
export const InkChip = forwardRef<HTMLButtonElement, InkChipProps>(function InkChip(
  { picked, layout, className, children, onPointerDown, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={picked}
      data-down={picked}
      onPointerDown={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--ink-x", `${e.clientX - box.left}px`);
        e.currentTarget.style.setProperty("--ink-y", `${e.clientY - box.top}px`);
        onPointerDown?.(e);
      }}
      onKeyDown={(e) => {
        e.currentTarget.style.removeProperty("--ink-x");
        e.currentTarget.style.removeProperty("--ink-y");
      }}
      className={cn(
        "piece piece-chip relative overflow-hidden border-2 border-cocoa bg-card font-display font-bold text-cocoa focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
        !picked && "hover:bg-cream-deep/50",
        layout,
        className,
      )}
      {...props}
    >
      {children}
      {picked && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 bg-cocoa text-cream-bright animate-[ink-in_0.24s_var(--ease-out)] motion-reduce:animate-none [&_span]:text-cream-bright",
            layout,
          )}
        >
          {children}
        </span>
      )}
    </button>
  );
});
