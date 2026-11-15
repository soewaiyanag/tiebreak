import { useState } from "react";
import { BallotFieldset } from "../poll/BallotFieldset";
import { BallotSlip } from "../poll/BallotSlip";
import { LeaderCard } from "../poll/LeaderCard";
import { StatusSticker } from "../poll/StatusSticker";
import { VoterCrewStack } from "../poll/VoterCrewStack";
import { Button } from "../ui/Button";
import { linkButtonClasses } from "../ui/link-button-classes";
import { useAnnouncer } from "../../hooks/useAnnouncer";
import { presentTally } from "../../lib/tally";
import { DEMO_OPTIONS, DEMO_TITLE, DEMO_YOU, demoResults } from "./demo-poll";

const DEMO_TIME_LEFT_MS = (2 * 60 + 14) * 60_000;

/**
 * The real vote page, playable on the landing page: pick, cast, watch the
 * stamp land and the race update. Nothing is sent anywhere; reloading or
 * "Vote again" starts it over.
 */
export function LandingDemo() {
  const { announceStatus } = useAnnouncer();
  const [closesAt] = useState(() => new Date(Date.now() + DEMO_TIME_LEFT_MS).toISOString());
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [cast, setCast] = useState(false);

  const pickedLabel = DEMO_OPTIONS.find((o) => o.id === pickedId)?.label;
  const results = demoResults("open", cast ? pickedId : null);
  const presentation = presentTally(results.tallies);
  const leader = DEMO_OPTIONS.find((o) => o.id === presentation.leaders[0])!;

  function castVote() {
    setCast(true);
    announceStatus(`Vote counted for ${pickedLabel}`);
  }

  function reset() {
    setCast(false);
    setPickedId(null);
  }

  return (
    <section
      aria-labelledby="demo-title"
      className="rounded-[2rem] border-[length:var(--border-card)] border-cocoa bg-cocoa p-3 sm:p-5"
    >
      <div className="rounded-[1.5rem] border-[length:var(--border-card)] border-cocoa bg-cream p-5 sm:p-7">
        <StatusSticker state="open" closesAt={closesAt} />
        <h2 id="demo-title" className="mt-3 text-balance font-display text-xl font-black text-cocoa">
          {DEMO_TITLE}
        </h2>

        {!cast ? (
          <div className="mt-5">
            <BallotFieldset
              options={DEMO_OPTIONS}
              type="single"
              maxChoices={1}
              selectedIds={pickedId ? [pickedId] : []}
              onToggle={setPickedId}
            />
            <Button variant="primary" className="mt-6 w-full py-3" disabled={!pickedId} onClick={castVote}>
              {pickedLabel ? `Cast my vote for ${pickedLabel}` : "Pick one to vote"}
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <BallotSlip voter={DEMO_YOU} optionLabels={pickedLabel ? [pickedLabel] : []} justCast />
            <VoterCrewStack
              crew={results.voterCrew ?? []}
              lastVoteAt={results.lastVoteAt}
              you={DEMO_YOU}
              youJustJoined
            />
            <div className="animate-[check-in_0.25s_var(--ease-out)_0.9s_both] motion-reduce:animate-none">
              <LeaderCard
                option={leader}
                tally={presentation.options.find((t) => t.optionId === leader.id)!}
                totalVotes={presentation.totalVotes}
                aheadBy={presentation.aheadBy}
                isTie={presentation.isTie}
                useSegmentedTally={presentation.useSegmentedTally}
              />
            </div>
            <button type="button" onClick={reset} className={linkButtonClasses()}>
              Vote again
            </button>
          </div>
        )}
      </div>
      <p className="px-3 pb-1 pt-4 font-body text-sm text-cream-bright/80 sm:px-2">
        This is the real vote page. In the app, the whole chat opens it from one link. Here, nothing leaves your
        browser.
      </p>
    </section>
  );
}
