import { useState } from "react";
import { BallotFieldset } from "../poll/BallotFieldset";
import { StatusSticker } from "../poll/StatusSticker";
import { Button } from "../ui/Button";
import { DEMO_OPTIONS, DEMO_TITLE } from "./demo-poll";

const DEMO_TIME_LEFT_MS = (2 * 60 + 14) * 60_000;
const PICK = DEMO_OPTIONS[0];

/** The real vote page as a still picture, caught just before the vote: one pick made, the cast button ready. Nothing to press. */
export function LandingDemo() {
  const [closesAt] = useState(() => new Date(Date.now() + DEMO_TIME_LEFT_MS).toISOString());

  return (
    <section
      aria-label="The vote page"
      className="rounded-[2rem] border-[length:var(--border-card)] border-cocoa bg-cocoa p-3 sm:p-5"
    >
      <p className="sr-only">
        A picture of the vote page for the Pizza night poll: four pizza options, with {PICK.label} picked and ready
        to cast.
      </p>
      {/* An illustration, not a form: hidden from assistive tech and unfocusable, the paragraph above carries it. */}
      <div
        aria-hidden="true"
        inert
        className="rounded-[1.5rem] border-[length:var(--border-card)] border-cocoa bg-cream p-5 sm:p-7"
      >
        <StatusSticker state="open" closesAt={closesAt} />
        <h2 className="mt-3 text-balance font-display text-xl font-black text-cocoa">{DEMO_TITLE}</h2>
        {/* A still: the picked option's check skips its pop-in. */}
        <div className="mt-5 [&_svg]:animate-none">
          <BallotFieldset
            options={DEMO_OPTIONS}
            type="single"
            maxChoices={1}
            selectedIds={[PICK.id]}
            onToggle={() => {}}
          />
          <Button variant="primary" className="mt-6 w-full py-3">
            Cast my vote for {PICK.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
