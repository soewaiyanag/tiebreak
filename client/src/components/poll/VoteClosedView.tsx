import type { PollResults, PublicPoll } from "@tiebreak/shared";
import { Pill } from "../ui/Pill";
import { Reveal } from "./Reveal";

interface VoteClosedViewProps {
  poll: PublicPoll;
  results: PollResults;
  votedOptionLabels?: string[];
  viewerOptionId: string | null;
}

/** The latecomer's view — and the returning voter's, once the poll settles. Not an error page, a result. */
export function VoteClosedView({ poll, results, votedOptionLabels, viewerOptionId }: VoteClosedViewProps) {
  return (
    <>
      <Pill tone="neutral">Settled</Pill>
      <h1 className="mt-3 text-balance font-display text-2xl font-black text-cocoa">{poll.title}</h1>
      {votedOptionLabels && votedOptionLabels.length > 0 && (
        <p className="mt-2 font-body text-sm font-bold text-teal-deep">You backed {votedOptionLabels.join(" and ")}</p>
      )}
      <div className="mt-6">
        <Reveal pollId={poll.id} options={poll.options} results={results} viewerOptionId={viewerOptionId} />
      </div>
    </>
  );
}
