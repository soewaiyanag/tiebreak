import type { PublicOption, PollResults } from "@tiebreak/shared";
import { Card } from "../ui/Card";
import { LeaderCard } from "./LeaderCard";
import { OptionRow } from "./OptionRow";
import { presentTally } from "../../lib/tally";

interface VoterResultsProps {
  options: PublicOption[];
  results: PollResults;
}

/**
 * The voter's view of a still-open race after voting, or on a return visit
 * (design challenge 1) — same honest results as the creator sees, no
 * moderation or share controls. "You backed X" is shown by the caller via
 * the ballot's own selected-state styling, not repeated here.
 */
export function VoterResults({ options, results }: VoterResultsProps) {
  const presentation = presentTally(results.tallies);
  const leaderOptions = options.filter((o) => presentation.leaders.includes(o.id));
  const trailingOptions = options.filter((o) => !presentation.leaders.includes(o.id));

  if (presentation.totalVotes === 0) {
    return <p className="font-body text-sm text-cocoa-soft">No votes yet — check back once your crew has voted.</p>;
  }

  return (
    <div className="space-y-4">
      {presentation.isTie ? (
        <>
          <p className="font-body text-sm font-bold text-cocoa">
            Tied at {presentation.options.find((t) => t.optionId === leaderOptions[0]?.id)?.votes} votes each — still
            anyone's game
          </p>
          <div className="space-y-3">
            {leaderOptions.map((option) => (
              <LeaderCard
                key={option.id}
                option={option}
                tally={presentation.options.find((t) => t.optionId === option.id)!}
                totalVotes={presentation.totalVotes}
                aheadBy={0}
                isTie
                useSegmentedTally={presentation.useSegmentedTally}
              />
            ))}
          </div>
        </>
      ) : (
        leaderOptions[0] && (
          <LeaderCard
            option={leaderOptions[0]}
            tally={presentation.options.find((t) => t.optionId === leaderOptions[0].id)!}
            totalVotes={presentation.totalVotes}
            aheadBy={presentation.aheadBy}
            isTie={false}
            useSegmentedTally={presentation.useSegmentedTally}
          />
        )
      )}

      {trailingOptions.length > 0 && (
        <Card className="py-2">
          <ul>
            {trailingOptions.map((option) => (
              <OptionRow
                key={option.id}
                option={option}
                tally={presentation.options.find((t) => t.optionId === option.id)!}
              />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
