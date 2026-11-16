import { useRef, useState } from "react";
import type { PublicOption } from "@tiebreak/shared";
import { BallotFieldset } from "../poll/BallotFieldset";
import { BallotSlip } from "../poll/BallotSlip";
import { LeaderCard } from "../poll/LeaderCard";
import { StatusSticker } from "../poll/StatusSticker";
import { VoterCrewStack } from "../poll/VoterCrewStack";
import { Button } from "../ui/Button";
import { linkButtonClasses } from "../ui/link-button-classes";
import { useAnnouncer } from "../../hooks/useAnnouncer";
import { cn } from "../../lib/cn";
import { presentTally } from "../../lib/tally";
import { DEMO_OPTIONS, DEMO_TITLE, DEMO_YOU, demoResults } from "./demo-poll";

const DEMO_TIME_LEFT_MS = (2 * 60 + 14) * 60_000;
const PICK_PROMPT = "Pick one to vote";
const castLabel = (option: PublicOption) => `Cast my vote for ${option.label}`;

/**
 * The real vote page, playable on the landing page: pick, cast, watch the
 * stamp land and the race update. Nothing is sent anywhere; "Vote again"
 * starts it over.
 *
 * The card never changes height. Every screen it can show (the ballot, and
 * the result for each possible pick) sits in the same grid cell, all always
 * rendered, and only the current one is visible. The cell is as tall as the
 * tallest of them, whichever option you pick.
 */
export function LandingDemo() {
  const { announceStatus } = useAnnouncer();
  const [closesAt] = useState(() => new Date(Date.now() + DEMO_TIME_LEFT_MS).toISOString());
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [castId, setCastId] = useState<string | null>(null);
  // Bumped on every cast, so the result screens remount and the stamp lands again.
  const [castCount, setCastCount] = useState(0);
  const ballotRef = useRef<HTMLDivElement>(null);

  const picked = DEMO_OPTIONS.find((o) => o.id === pickedId);

  function castVote() {
    setCastId(pickedId);
    setCastCount((n) => n + 1);
    announceStatus(`Vote counted for ${picked!.label}`);
  }

  function reset() {
    setCastId(null);
    setPickedId(null);
    // The "Vote again" button is about to hide; put focus back at the top of the ballot.
    requestAnimationFrame(() => ballotRef.current?.querySelector("input")?.focus());
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

        <div className="mt-5 grid">
          <div ref={ballotRef} className={cn("[grid-area:1/1]", castId && "invisible")}>
            <BallotFieldset
              options={DEMO_OPTIONS}
              type="single"
              maxChoices={1}
              selectedIds={pickedId ? [pickedId] : []}
              onToggle={setPickedId}
            />
            <Button variant="primary" className="mt-6 w-full py-3" disabled={!picked} onClick={castVote}>
              {/* Every label the button can show, stacked: it's always as tall as the longest one. */}
              <span className="grid">
                {[PICK_PROMPT, ...DEMO_OPTIONS.map(castLabel)].map((label) => (
                  <span
                    key={label}
                    className={cn("[grid-area:1/1]", label !== (picked ? castLabel(picked) : PICK_PROMPT) && "invisible")}
                  >
                    {label}
                  </span>
                ))}
              </span>
            </Button>
          </div>

          {DEMO_OPTIONS.map((option) => (
            <CastResult
              key={`${option.id}-${castCount}`}
              option={option}
              shown={castId === option.id}
              onVoteAgain={reset}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** What the page shows after casting for `option`. Rendered (invisibly) for every option, to hold the card's height. */
function CastResult({ option, shown, onVoteAgain }: { option: PublicOption; shown: boolean; onVoteAgain: () => void }) {
  const results = demoResults("open", option.id);
  const presentation = presentTally(results.tallies);
  const leader = DEMO_OPTIONS.find((o) => o.id === presentation.leaders[0])!;

  return (
    <div className={cn("space-y-4 [grid-area:1/1]", !shown && "invisible")}>
      <BallotSlip voter={DEMO_YOU} optionLabels={[option.label]} justCast={shown} />
      <VoterCrewStack crew={results.voterCrew ?? []} lastVoteAt={results.lastVoteAt} you={DEMO_YOU} youJustJoined={shown} />
      <div className={cn(shown && "animate-[check-in_0.25s_var(--ease-out)_0.9s_both] motion-reduce:animate-none")}>
        <LeaderCard
          option={leader}
          tally={presentation.options.find((t) => t.optionId === leader.id)!}
          totalVotes={presentation.totalVotes}
          aheadBy={presentation.aheadBy}
          isTie={presentation.isTie}
          useSegmentedTally={presentation.useSegmentedTally}
        />
      </div>
      {/* Focus lands here after casting, so keyboard users don't lose their place when the ballot hides. */}
      <button type="button" autoFocus={shown} onClick={onVoteAgain} className={linkButtonClasses()}>
        Vote again
      </button>
    </div>
  );
}
