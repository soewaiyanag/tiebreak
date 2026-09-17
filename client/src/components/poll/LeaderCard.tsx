import type { OptionPresentation } from "../../lib/tally";
import type { BallotOption } from "../../lib/poll-options";
import { Avatar } from "../ui/Avatar";
import { SegmentedTally } from "./SegmentedTally";

interface LeaderCardProps {
  option: BallotOption;
  tally: OptionPresentation;
  totalVotes: number;
  aheadBy: number;
  isTie: boolean;
  useSegmentedTally: boolean;
}

/** guidance/brand-kit.md — the one tangerine moment on the live results screen. */
export function LeaderCard({ option, tally, totalVotes, aheadBy, isTie, useSegmentedTally }: LeaderCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[length:var(--radius-lg)] border-[length:var(--border-card)] border-cocoa bg-tangerine p-6">
      {!isTie && totalVotes > 0 && (
        <span className="absolute right-[-2.75rem] top-4 w-40 rotate-45 bg-butter py-1 text-center font-display text-xs font-black uppercase tracking-[0.06em] text-cocoa">
          In the lead
        </span>
      )}

      <h2 className="max-w-[85%] text-balance font-display text-xl font-black leading-[var(--leading-tight)] text-cream-bright">
        {option.label}
      </h2>

      {option.suggestedBy && (
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-scrim-on-tangerine)] px-3 py-1 font-body text-sm font-bold text-cream-bright">
          <Avatar avatar={option.suggestedBy.avatar} size={24} alt="" />
          Suggested by {option.suggestedBy.name}
        </span>
      )}

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <p className="font-display text-num font-black leading-[var(--leading-num)] tabular-nums text-cream-bright">
          {tally.percentage}
          <span className="text-xl">%</span>
        </p>
        <p className="rounded-full bg-[var(--color-scrim-on-tangerine)] px-3.5 py-1.5 font-body text-sm font-bold tabular-nums text-cream-bright">
          {tally.votes} of {totalVotes} vote{totalVotes === 1 ? "" : "s"}
          {aheadBy > 0 && ` · ahead by ${aheadBy}`}
        </p>
      </div>

      {useSegmentedTally && (
        <div className="mt-4">
          <SegmentedTally totalVotes={totalVotes} filledCount={tally.votes} />
        </div>
      )}
    </div>
  );
}
