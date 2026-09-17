import type { PollResults, PublicPoll } from "@tiebreak/shared";
import { Pill } from "../ui/Pill";
import { linkButtonClasses } from "../ui/link-button-classes";
import { VoterResults } from "./VoterResults";

interface VoteAlreadyVotedViewProps {
  poll: PublicPoll;
  results: PollResults;
  votedOptionLabels: string[];
  onSuggestClick: () => void;
}

/** The return visit while voting is still open (design challenge 1) — read-only, no takebacks. */
export function VoteAlreadyVotedView({ poll, results, votedOptionLabels, onSuggestClick }: VoteAlreadyVotedViewProps) {
  return (
    <>
      <Pill tone="teal">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-deep" aria-hidden="true" />
        Voting open
      </Pill>
      <h1 className="mt-3 text-balance font-display text-2xl font-black text-cocoa">{poll.title}</h1>
      <p className="mt-2 font-body text-sm font-bold text-teal-deep">
        You backed {votedOptionLabels.join(" and ")} — thanks for voting, no takebacks
      </p>
      <div className="mt-6">
        <VoterResults options={poll.options} results={results} />
      </div>
      {poll.suggestionsEnabled && (
        <button
          type="button"
          onClick={onSuggestClick}
          className={linkButtonClasses("mt-6")}
        >
          Suggest something else
        </button>
      )}
    </>
  );
}
