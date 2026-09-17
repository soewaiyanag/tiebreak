import type { Option, PollResults } from "@tiebreak/shared";
import { Card } from "../ui/Card";
import { presentTally } from "../../lib/tally";
import { useShouldPlayReveal } from "../../lib/use-reveal-seen";
import { RevealTie } from "./RevealTie";
import { RevealWinner } from "./RevealWinner";

interface RevealProps {
  pollId: string;
  options: Option[];
  results: PollResults;
  /** The option this viewer backed, if any — "You backed Veggie supreme" stays visible in every state. */
  viewerOptionId?: string | null;
}

/** Dispatches to the right reveal shape: nobody voted, a tie, or a clear winner. Design challenge 2. */
export function Reveal({ pollId, options, results, viewerOptionId }: RevealProps) {
  const shouldAnimate = useShouldPlayReveal(pollId);
  const presentation = presentTally(results.tallies);
  const entranceClass = shouldAnimate ? "animate-[reveal-in_0.6s_ease-out] motion-reduce:animate-none" : "";

  if (presentation.totalVotes === 0) {
    return (
      <Card className={entranceClass}>
        <p className="font-body text-base text-cocoa-soft">Voting ended before anyone weighed in.</p>
      </Card>
    );
  }

  const winners = options.filter((o) => presentation.leaders.includes(o.id));

  return (
    <div className={entranceClass}>
      {presentation.isTie ? (
        <RevealTie presentation={presentation} winners={winners} results={results} viewerOptionId={viewerOptionId} />
      ) : (
        <RevealWinner
          presentation={presentation}
          options={options}
          winner={winners[0]}
          results={results}
          viewerOptionId={viewerOptionId}
        />
      )}
    </div>
  );
}
