import type { Option, PollDetail } from "@tiebreak/shared";
import { Card } from "../ui/Card";
import { Pill } from "../ui/Pill";
import { Button } from "../ui/Button";
import { LeaderCard } from "./LeaderCard";
import { OptionRow } from "./OptionRow";
import { VoterCrewStack } from "./VoterCrewStack";
import { PendingSuggestionCard } from "./PendingSuggestionCard";
import { presentTally } from "../../lib/tally";
import { formatClosingTime } from "../../lib/format";
import { ballotOf } from "../../lib/poll-options";
import type { RefObject } from "react";

interface LivePollBodyProps {
  poll: PollDetail;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onApproveSuggestion: (suggestion: Option) => void;
  onDeclineSuggestion: (suggestion: Option) => void;
  onEndVoting: () => void;
  onCopyLink: () => void;
}

/** The live results screen — hard problem #2's payoff: one glance answers "who's winning, and is it close?" */
export function LivePollBody({
  poll,
  headingRef,
  onApproveSuggestion,
  onDeclineSuggestion,
  onEndVoting,
  onCopyLink,
}: LivePollBodyProps) {
  const options = ballotOf(poll);
  const presentation = presentTally(poll.results.tallies);
  const leaderOptions = options.filter((o) => presentation.leaders.includes(o.id));
  const trailingOptions = options.filter((o) => !presentation.leaders.includes(o.id));
  const pendingSuggestions = poll.options.filter((o) => o.suggestionStatus === "pending");
  const shareUrl = `${window.location.origin}/p/${poll.slug}`;

  return (
    <>
      <Pill tone="teal">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-deep" aria-hidden="true" />
        Voting open
      </Pill>
      <span className="ml-2 inline-block">
        <Pill tone="neutral">Closes {formatClosingTime(poll.closesAt)}</Pill>
      </span>

      <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-balance font-display text-2xl font-black text-cocoa">
        {poll.title}
      </h1>

      <div className="mt-3">
        <VoterCrewStack crew={poll.results.voterCrew ?? []} lastVoteAt={poll.results.lastVoteAt} />
      </div>

      <div className="mt-6 space-y-4">
        {presentation.totalVotes === 0 ? (
          <p className="font-body text-sm text-cocoa-soft">
            No votes yet — share the link below and come back once your crew has weighed in.
          </p>
        ) : presentation.isTie ? (
          <>
            <p className="font-body text-sm font-bold text-cocoa">
              Tied at {presentation.options.find((t) => t.optionId === leaderOptions[0]?.id)?.votes} votes each —
              still anyone's game
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

      {pendingSuggestions.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="font-display text-md font-extrabold text-cocoa">Pending suggestions</h2>
          {pendingSuggestions.map((suggestion) => (
            <PendingSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onApprove={() => onApproveSuggestion(suggestion)}
              onDecline={() => onDeclineSuggestion(suggestion)}
            />
          ))}
        </div>
      )}

      <Card className="mt-6 flex flex-col gap-4 bg-cream-deep sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 truncate font-body text-sm text-cocoa">
          Anyone with the link can vote: <span className="font-bold">{shareUrl}</span>
        </p>
        <div className="flex shrink-0 gap-3">
          <Button variant="secondary" onClick={onEndVoting}>
            End voting
          </Button>
          <Button variant="primary" onClick={onCopyLink}>
            Copy link
          </Button>
        </div>
      </Card>
      <p className="mt-3 font-body text-sm text-cocoa-soft">
        Ending early isn't final — you can reopen voting later if the crew changes its mind.
      </p>
    </>
  );
}
