import { formatCountdown } from "../../lib/format";
import { useNow } from "../../hooks/useNow";
import { cn } from "../../lib/cn";

type StatusStickerProps = { state: "open"; closesAt: string } | { state: "settled" };

/**
 * The poll's status as a sticker slapped on slightly crooked: ink outline,
 * a drawn icon, and words, never color alone. An open poll counts down;
 * a settled one says so. The countdown re-renders quietly (no live region):
 * announcing it every 30 seconds would drown out everything else.
 */
export function StatusSticker(props: StatusStickerProps) {
  const now = useNow();
  const open = props.state === "open";

  return (
    <span
      className={cn(
        "inline-flex -rotate-2 items-center gap-1.5 whitespace-nowrap rounded-[length:var(--radius-md)] border-2 border-cocoa px-2.5 py-1 font-display text-sm font-bold tabular-nums text-cocoa",
        open ? "bg-card" : "bg-cream-deep",
      )}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
        {open ? (
          <>
            <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M7 4.25V7l1.75 1.25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {open ? <time dateTime={props.closesAt}>{formatCountdown(props.closesAt, now)}</time> : "Settled"}
    </span>
  );
}
