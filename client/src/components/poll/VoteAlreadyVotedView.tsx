import type { Identity, PollResults, PublicPoll } from "@tiebreak/shared";
import { StatusSticker } from "./StatusSticker";
import { linkButtonClasses } from "../ui/link-button-classes";
import { VoterResults } from "./VoterResults";
import { BallotSlip } from "./BallotSlip";
import { VoterCrewStack } from "./VoterCrewStack";

interface VoteAlreadyVotedViewProps {
  poll: PublicPoll;
  results: PollResults;
  votedOptionLabels: string[];
  you: Identity;
  /** True only straight after casting in this visit: plays the slip, stamp and crew-drop once. */
  justVoted: boolean;
  onSuggestClick: () => void;
}

/** The return visit while voting is still open (design challenge 1) — read-only, no takebacks. */
export function VoteAlreadyVotedView({
  poll,
  results,
  votedOptionLabels,
  you,
  justVoted,
  onSuggestClick,
}: VoteAlreadyVotedViewProps) {
  return (
    <>
      {/* Named for the vote view transition: the sticker and title stay put while the page below swaps. */}
      <span className="inline-block [view-transition-name:poll-status]">
        <StatusSticker state="open" closesAt={poll.closesAt} />
      </span>
      <h1 className="mt-3 text-balance font-display text-2xl font-black text-cocoa [view-transition-name:poll-title]">
        {poll.title}
      </h1>
      <div className="mt-5">
        <BallotSlip voter={you} optionLabels={votedOptionLabels} justCast={justVoted} />
      </div>
      <div className="mt-4">
        <VoterCrewStack
          crew={results.voterCrew ?? []}
          lastVoteAt={results.lastVoteAt}
          you={you}
          youJustJoined={justVoted}
        />
      </div>
      <div className="mt-6">
        <VoterResults options={poll.options} results={results} />
      </div>
      {poll.suggestionsEnabled && (
        <button type="button" onClick={onSuggestClick} className={linkButtonClasses("mt-6")}>
          Suggest something else
        </button>
      )}
    </>
  );
}
