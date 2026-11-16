import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BallotFieldset } from "../poll/BallotFieldset";
import { BallotSlip } from "../poll/BallotSlip";
import { LeaderCard } from "../poll/LeaderCard";
import { StatusSticker } from "../poll/StatusSticker";
import { VoterCrewStack } from "../poll/VoterCrewStack";
import { Button } from "../ui/Button";
import { cn } from "../../lib/cn";
import { presentTally } from "../../lib/tally";
import { DEMO_OPTIONS, DEMO_TITLE, DEMO_YOU, demoResults } from "./demo-poll";

const DEMO_TIME_LEFT_MS = (2 * 60 + 14) * 60_000;

// Always the same pick, so both panels hold the same text every loop and the card never resizes.
const PICK = DEMO_OPTIONS[0];
const RESULTS = demoResults("open", PICK.id);
const PRESENTATION = presentTally(RESULTS.tallies);
const LEADER = DEMO_OPTIONS.find((o) => o.id === PRESENTATION.leaders[0])!;

/** The demo's storyboard: each beat holds for `ms`, then the next one plays. The last beat loops to the first. */
const SCRIPT = [
  { beat: "rest", ms: 1400 },
  { beat: "toOption", ms: 900 },
  { beat: "clickOption", ms: 160 },
  { beat: "picked", ms: 900 },
  { beat: "toButton", ms: 800 },
  { beat: "clickButton", ms: 160 },
  { beat: "cast", ms: 5200 },
] as const;
type Beat = (typeof SCRIPT)[number]["beat"];

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The real vote page, playing itself like a screen recording: a cursor picks
 * an option, casts, and the stamp lands. Both screens stay mounted in one grid
 * cell, so the card is always as tall as the taller one and never jumps.
 */
export function LandingDemo() {
  const [closesAt] = useState(() =>
    new Date(Date.now() + DEMO_TIME_LEFT_MS).toISOString(),
  );
  // Reduced motion starts paused on the payoff screen; the play button still runs it.
  const [step, setStep] = useState(() =>
    reducedMotion() ? SCRIPT.length - 1 : 0,
  );
  const [loop, setLoop] = useState(0);
  const [playing, setPlaying] = useState(() => !reducedMotion());
  const [onScreen, setOnScreen] = useState(true);

  const stageRef = useRef<HTMLDivElement>(null);
  const ballotRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const beat: Beat = SCRIPT[step].beat;
  const picked = step >= SCRIPT.findIndex((s) => s.beat === "picked");
  const cast = beat === "cast";

  // Advance the storyboard while playing and in view.
  useEffect(() => {
    if (!playing || !onScreen) return;
    const id = window.setTimeout(() => {
      const next = (step + 1) % SCRIPT.length;
      if (next === 0) setLoop((n) => n + 1);
      setStep(next);
    }, SCRIPT[step].ms);
    return () => window.clearTimeout(id);
  }, [step, playing, onScreen]);

  // Nobody is watching an off-screen demo: stop the timers.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(stageRef.current!);
    return () => observer.disconnect();
  }, []);

  // Move the cursor to whatever this beat points at. Written straight to the DOM: it's
  // layout-dependent, and re-measured on resize so it stays on target.
  useLayoutEffect(() => {
    const stage = stageRef.current!;
    function place() {
      const cursor = cursorRef.current!;
      const box = stage.getBoundingClientRect();
      const target =
        beat === "toOption" || beat === "clickOption" || beat === "picked"
          ? ballotRef.current!.querySelectorAll("label")[
              DEMO_OPTIONS.indexOf(PICK)
            ]
          : beat === "toButton" || beat === "clickButton"
            ? ballotRef.current!.querySelector("button")
            : null;
      const rect = target?.getBoundingClientRect();
      const x = rect
        ? rect.left - box.left + rect.width * 0.62
        : box.width - 56;
      const y = rect
        ? rect.top - box.top + rect.height * 0.55
        : box.height - 48;
      cursor.style.translate = `${x}px ${y}px`;
    }
    place();
    const observer = new ResizeObserver(place);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [beat]);

  return (
    <section
      aria-label="Demo: voting on a poll"
      className="rounded-[2rem] border-[length:var(--border-card)] border-cocoa bg-cocoa p-3 sm:p-5"
    >
      <p className="sr-only">
        A looping demo of the vote page: someone picks {PICK.label}, casts their
        vote, and the race updates with {LEADER.label} in the lead.
      </p>
      {/* A recording, not a control: hidden from assistive tech and unfocusable, the paragraph above carries it. */}
      <div
        ref={stageRef}
        aria-hidden="true"
        inert
        className="relative overflow-hidden rounded-[1.5rem] border-[length:var(--border-card)] border-cocoa bg-cream p-5 sm:p-7"
      >
        <StatusSticker state="open" closesAt={closesAt} />
        <h2 className="mt-3 text-balance font-display text-xl font-black text-cocoa">
          {DEMO_TITLE}
        </h2>

        <div className="mt-5 grid">
          <div
            ref={ballotRef}
            className={cn(
              "[grid-area:1/1] transition-opacity duration-300",
              cast && "invisible opacity-0",
            )}
          >
            <BallotFieldset
              options={DEMO_OPTIONS}
              type="single"
              maxChoices={1}
              selectedIds={picked ? [PICK.id] : []}
              onToggle={() => {}}
            />
            <Button
              variant="primary"
              data-down={beat === "clickButton"}
              className="mt-6 w-full py-3"
              disabled={!picked}
            >
              {picked ? `Cast my vote for ${PICK.label}` : "Pick one to vote"}
            </Button>
          </div>

          {/* Re-keyed each loop so the slip, stamp and avatar drop replay on every cast. */}
          <div
            key={cast ? `cast-${loop}` : "waiting"}
            className={cn("space-y-4 [grid-area:1/1]", !cast && "invisible")}
          >
            <BallotSlip
              voter={DEMO_YOU}
              optionLabels={[PICK.label]}
              justCast={cast}
            />
            <VoterCrewStack
              crew={RESULTS.voterCrew ?? []}
              lastVoteAt={RESULTS.lastVoteAt}
              you={DEMO_YOU}
              youJustJoined={cast}
            />
            <div
              className={cn(
                cast &&
                  "animate-[check-in_0.25s_var(--ease-out)_0.9s_both] motion-reduce:animate-none",
              )}
            >
              <LeaderCard
                option={LEADER}
                tally={PRESENTATION.options.find(
                  (t) => t.optionId === LEADER.id,
                )!}
                totalVotes={PRESENTATION.totalVotes}
                aheadBy={PRESENTATION.aheadBy}
                isTie={PRESENTATION.isTie}
                useSegmentedTally={PRESENTATION.useSegmentedTally}
              />
            </div>
          </div>
        </div>

        {/* The fake pointer. Its travel is a transition on `translate`; a click is a quick squeeze. */}
        <div
          ref={cursorRef}
          className={cn(
            "pointer-events-none absolute left-0 top-0 transition-[translate,opacity] duration-700 ease-in-out motion-reduce:transition-none",
            (cast || beat === "rest") && "opacity-0", // hidden at rest, so it fades in on its way to the option
          )}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            className={cn(
              "drop-shadow-[2px_2px_0_var(--color-cocoa)] transition-transform duration-100",
              beat.startsWith("click") && "scale-[0.82]",
            )}
          >
            <path
              d="M3 2l7.5 19 2.6-7.9L21 10.5z"
              fill="var(--color-cream-bright)"
              stroke="var(--color-cocoa)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-4 sm:px-2">
        <p className="font-body text-sm text-cream-bright/80">
          The real vote page, playing on its own. In the app, the whole chat
          opens it from one link.
        </p>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="shrink-0 rounded-full border-2 border-cream-bright/40 px-3 py-1 font-body text-sm font-bold text-cream-bright hover:border-cream-bright focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </section>
  );
}
