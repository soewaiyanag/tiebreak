import type { PollResults } from "@tiebreak/shared";
import type { BallotOption } from "../../lib/poll-options";
import type { TallyPresentation } from "../../lib/tally";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { backersLine } from "../../lib/reveal-text";
import { RevealBackerRow } from "./RevealBackerRow";

interface RevealWinnerProps {
  presentation: TallyPresentation;
  options: BallotOption[];
  winner: BallotOption;
  results: PollResults;
  viewerOptionId?: string | null;
}

/** The hero moment — butter and tangerine's loudest use (guidance/brand-kit.md "Key Screens for Design Quality"). */
export function RevealWinner({ presentation, options, winner, results, viewerOptionId }: RevealWinnerProps) {
  const winnerTally = presentation.options.find((t) => t.optionId === winner.id)!;
  const voters = results.attribution?.find((a) => a.optionId === winner.id)?.voters ?? [];
  const others = options.filter((o) => o.id !== winner.id);

  return (
    <>
      <div className="relative overflow-hidden rounded-[length:var(--radius-lg)] border-[length:var(--border-card)] border-cocoa bg-tangerine p-8 text-center">
        <span className="absolute right-[-2.75rem] top-4 w-40 rotate-45 bg-butter py-1 text-center font-display text-xs font-black uppercase tracking-[0.06em] text-cocoa">
          Winner
        </span>
        <p className="font-body text-sm font-bold uppercase tracking-[0.06em] text-cream-bright/80">
          {winner.id === viewerOptionId ? "You called it" : "Settled"}
        </p>
        <h2 className="mt-2 text-balance font-display text-xl font-black text-cream-bright">{winner.label}</h2>
        <p className="mt-3 font-display text-num font-black tabular-nums text-cream-bright">
          {winnerTally.percentage}
          <span className="text-xl">%</span>
        </p>
        <p className="mt-2 font-body text-sm font-bold text-cream-bright">
          {winnerTally.votes} of {presentation.totalVotes} vote{presentation.totalVotes === 1 ? "" : "s"}
        </p>
        <p className="mt-4 flex items-center justify-center gap-1.5 font-body text-sm text-cream-bright">
          {voters.slice(0, 3).map((v, i) => (
            <Avatar key={i} avatar={v.avatar} size={24} alt="" />
          ))}
          {backersLine(voters)}
        </p>
      </div>

      {others.length > 0 && (
        <Card className="mt-4 py-2">
          {others.map((option) => (
            <RevealBackerRow
              key={option.id}
              option={option}
              tally={presentation.options.find((t) => t.optionId === option.id)!}
              results={results}
              viewerOptionId={viewerOptionId}
            />
          ))}
        </Card>
      )}
    </>
  );
}
