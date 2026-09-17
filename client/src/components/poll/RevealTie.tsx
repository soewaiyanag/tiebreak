import type { PollResults } from "@tiebreak/shared";
import type { BallotOption } from "../../lib/poll-options";
import type { TallyPresentation } from "../../lib/tally";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { backersLine } from "../../lib/reveal-text";

interface RevealTieProps {
  presentation: TallyPresentation;
  winners: BallotOption[];
  results: PollResults;
  viewerOptionId?: string | null;
}

/** "It's a Tiebreak" — the one outcome the product is named after, presented as unfinished business, not a bug. */
export function RevealTie({ presentation, winners, results, viewerOptionId }: RevealTieProps) {
  const tiedVotes = presentation.options.find((t) => t.optionId === winners[0]?.id)?.votes ?? 0;

  return (
    <div className="space-y-3">
      <div className="rounded-[length:var(--radius-lg)] border-[length:var(--border-card)] border-cocoa bg-butter p-6 text-center">
        <p className="font-display text-lg font-black text-cocoa">It's a Tiebreak</p>
        <p className="mt-1 font-body text-base font-bold text-cocoa">Tied at {tiedVotes} votes each</p>
      </div>
      {winners.map((option) => {
        const voters = results.attribution?.find((a) => a.optionId === option.id)?.voters ?? [];
        return (
          <Card key={option.id} className="border-tangerine-deep">
            <h3 className="font-display text-md font-extrabold text-cocoa">
              {option.label}
              {option.id === viewerOptionId && (
                <span className="ml-2 font-body text-sm font-bold text-teal-deep">You backed this</span>
              )}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 font-body text-sm text-cocoa-soft">
              {voters.slice(0, 3).map((v, i) => (
                <Avatar key={i} avatar={v.avatar} size={20} alt="" />
              ))}
              {backersLine(voters)}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
