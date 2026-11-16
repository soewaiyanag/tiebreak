import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Logo } from "../components/layout/Logo";
import { SkipLink } from "../components/layout/SkipLink";
import { LandingDemo } from "../components/landing/LandingDemo";
import {
  DEMO_CREW,
  DEMO_OPTIONS,
  demoResults,
} from "../components/landing/demo-poll";
import { BallotSlip } from "../components/poll/BallotSlip";
import { Reveal } from "../components/poll/Reveal";
import { VoterResults } from "../components/poll/VoterResults";
import { buttonClasses } from "../components/ui/button-classes";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { STANDALONE } from "../lib/api-mode";
import { cn } from "../lib/cn";

const RISO_HEADING = "[text-shadow:0.045em_0.045em_0_var(--color-butter)]";

export function Landing() {
  useDocumentTitle("Tiebreak — settle it in the group chat");

  return (
    <>
      <SkipLink />
      <header className="mx-auto flex max-w-page items-center justify-between px-4 py-6">
        <Logo animated />
        <nav className="flex items-center gap-3">
          {STANDALONE ? (
            <Link to="/guest" className={buttonClasses("primary")}>
              Try the demo
            </Link>
          ) : (
            <>
              <Link to="/login" className={buttonClasses("secondary")}>
                Log in
              </Link>
              <Link to="/signup" className={buttonClasses("primary")}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main id="main">
        <section className="mx-auto grid max-w-page items-center gap-12 px-4 pb-20 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16 lg:pt-16">
          <div>
            <h1
              className={cn(
                "text-balance font-display text-[clamp(2.75rem,7vw,4.75rem)] font-black leading-[0.98] tracking-[-0.03em] text-cocoa",
                RISO_HEADING,
              )}
            >
              Stop the group chat going in circles.
            </h1>
            <p className="mt-6 max-w-[44ch] font-body text-md text-cocoa-soft">
              Make a poll, drop the link in the chat, and your crew votes from
              their phones. No accounts for voters, no spreadsheets, just a real
              answer before everyone loses interest.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/guest"
                className={buttonClasses("primary", "px-7 py-3")}
              >
                Try the demo
              </Link>
              {!STANDALONE && (
                <Link
                  to="/signup"
                  className={buttonClasses("secondary", "px-7 py-3")}
                >
                  Create an account
                </Link>
              )}
            </div>
          </div>
          <LandingDemo />
        </section>

        <section
          aria-labelledby="moments-title"
          className="border-t-[length:var(--border-divider)] border-dashed border-cream-deep"
        >
          <div className="mx-auto max-w-page px-4 py-20">
            <h2
              id="moments-title"
              className={cn(
                "max-w-[18ch] text-balance font-display text-[2.5rem] font-black leading-[1.02] tracking-[-0.02em] text-cocoa",
                RISO_HEADING,
              )}
            >
              From the chat to a decision
            </h2>

            <div className="mt-14 space-y-20">
              <Moment
                title="Your crew votes in seconds"
                body="They tap the link, type a name, pick a face and vote. No account, no app to install, and no changing it afterwards."
              >
                {(seen) => (
                  <div className={cn(!seen && "invisible")}>
                    <BallotSlip
                      voter={DEMO_CREW[0]}
                      optionLabels={[DEMO_OPTIONS[0].label]}
                      justCast={seen}
                    />
                  </div>
                )}
              </Moment>

              <Moment
                flip
                title="A race you can actually read"
                body="Eleven votes is a normal poll, so every percentage comes with its count, the leader gets one tick per voter, and a tie gets said out loud instead of hidden by a sort order."
              >
                {(seen) => (
                  // The numbers are there from the start; only the bars wait, then fill out to their counts.
                  <div
                    className={cn(
                      "[&_[data-pack-fill]]:origin-left",
                      seen
                        ? "[&_[data-pack-fill]]:animate-[pack-fill_0.8s_var(--ease-out)] motion-reduce:[&_[data-pack-fill]]:animate-none"
                        : "[&_[data-pack-fill]]:scale-x-0",
                    )}
                  >
                    <VoterResults
                      options={DEMO_OPTIONS}
                      results={demoResults("open")}
                    />
                  </div>
                )}
              </Moment>

              <Moment
                title="A proper ending"
                body="When voting closes, the winner gets a reveal worth screenshotting back into the chat. Changed your minds? Reopen it."
              >
                {(seen) => (
                  // The page plays the entrance on arrival; Reveal's own once-per-browser entrance
                  // would fire at page load, below the fold, so it's switched off here.
                  <div
                    className={cn(
                      seen
                        ? "animate-[reveal-in_0.6s_var(--ease-out)] motion-reduce:animate-none"
                        : "invisible",
                    )}
                  >
                    <Reveal
                      pollId="landing-demo"
                      options={DEMO_OPTIONS}
                      results={demoResults("settled")}
                      morphingIn
                    />
                  </div>
                )}
              </Moment>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="mx-auto flex max-w-page flex-col items-start gap-6 rounded-[2rem] border-[length:var(--border-card)] border-cocoa bg-cocoa px-8 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-12">
            <div>
              <h2 className="font-display text-[2rem] font-black leading-tight text-cream-bright">
                Try it with the demo crew
              </h2>
              <p className="mt-2 max-w-[48ch] font-body text-base text-cream-bright/80">
                The demo runs in your browser with five ready-made polls.
                Nothing to sign up for.
              </p>
            </div>
            <Link
              to="/guest"
              className={buttonClasses("primary", "shrink-0 px-8 py-3")}
            >
              Open the demo
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t-[length:var(--border-divider)] border-dashed border-cream-deep px-4 py-8 text-center font-body text-sm text-cocoa-soft">
        Tiebreak — a poll goes from created to decided inside one conversation.
      </footer>
    </>
  );
}

/**
 * One step of the story: words on one side, the real piece of the app on the other, sides alternating.
 * The piece plays its own moment once, when it's half on screen; `seen` tells it when.
 */
function Moment({
  title,
  body,
  flip = false,
  children,
}: {
  title: string;
  body: string;
  flip?: boolean;
  children: (seen: boolean) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Reduced motion: nothing to wait for, every piece is shown at rest from the start.
  const [seen, setSeen] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, [seen]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className={cn(flip && "lg:order-2")}>
        <h3 className="font-display text-xl font-black text-cocoa">{title}</h3>
        <p className="mt-3 max-w-[46ch] font-body text-base text-cocoa-soft">
          {body}
        </p>
      </div>
      {/* An illustration built from the real components: hidden from assistive tech and unfocusable, the words carry it. */}
      <div
        ref={ref}
        aria-hidden="true"
        inert
        className="rounded-[2rem] bg-cream-deep p-6 sm:p-8"
      >
        {children(seen)}
      </div>
    </div>
  );
}
