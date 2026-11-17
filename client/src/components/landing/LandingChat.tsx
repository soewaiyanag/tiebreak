import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Identity } from "@tiebreak/shared";
import { Logo } from "../layout/Logo";
import { StatusSticker } from "../poll/StatusSticker";
import { VoterCrewStack } from "../poll/VoterCrewStack";
import { Avatar } from "../ui/Avatar";
import { cn } from "../../lib/cn";
import { DEMO_CREW, DEMO_OPTIONS, DEMO_TITLE } from "./demo-poll";

const [PRIYA, JONAH] = DEMO_CREW;
const MORGAN: Identity = { name: "Morgan", avatar: { seed: "Morgan", tint: "cbe2d8" } };
const CLOSES_AT = new Date(Date.now() + (2 * 60 + 14) * 60_000).toISOString();
const WINNER = DEMO_OPTIONS[0];
/** Gap between messages arriving, and the stamp's wait after the result lands. */
const STEP_MS = 260;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The hero picture: a group chat going in circles until Morgan drops a
 * Tiebreak link, the crew votes, and the result comes back stamped. The
 * product's whole success case, told where it actually happens.
 *
 * On arrival the messages pop in one by one, like the chat happening, then the
 * stamp slams down. While the page scrolls, the two stickers (the poll link and
 * the result) tilt and drift a little: a CSS scroll-driven animation, so it
 * costs no JS and simply stays still where unsupported.
 */
export function LandingChat() {
  const ref = useRef<HTMLDivElement>(null);
  // Reduced motion: no arrival to wait for, the whole thread is there from the start.
  const [seen, setSeen] = useState(reducedMotion);

  useEffect(() => {
    if (seen) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setSeen(true), {
      threshold: 0.3,
    });
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, [seen]);

  // Each message pops in on its own beat; nothing shows before the thread is on screen.
  const beat = (i: number): { className: string; style?: CSSProperties } =>
    seen
      ? {
          className: "animate-[pop_0.32s_var(--ease-out)_both] motion-reduce:animate-none",
          style: { animationDelay: `${i * STEP_MS}ms` },
        }
      : { className: "invisible" };

  return (
    <figure className="w-full">
      <figcaption className="sr-only">
        A group chat about pizza night going in circles until Morgan shares a Tiebreak poll. Eleven friends vote, the
        result comes back stamped Settled: Detroit-style from Emmy's with 5 of 11 votes, and the chat agrees.
      </figcaption>
      {/* An illustration: hidden from assistive tech, the caption above carries it. Same panel as the moments below. */}
      <div ref={ref} aria-hidden="true" inert className="rounded-[2rem] bg-cream-deep p-5 sm:px-7 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xl font-black text-cocoa">Pizza crew</p>
          <p className="font-body text-sm text-cocoa-soft">12 people</p>
        </div>

        <ol className="mt-4 space-y-2.5">
          <Said by={PRIYA} {...beat(0)}>
            ok where are we ordering from
          </Said>
          <Said by={JONAH} {...beat(1)}>
            pepperoni. obviously
          </Said>
          {/* Morgan's message is the link itself: shared into the chat like a sticker on the table. */}
          <Shared by={MORGAN}>
            <Sticker tilt="-2.5deg" tiltTo="-5deg" {...beat(2)}>
              <div className="rounded-[length:var(--radius-lg)] border-[length:var(--border-card)] border-cocoa bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <Logo className="text-sm" />
                  <StatusSticker state="open" closesAt={CLOSES_AT} />
                </div>
                <p className="mt-2.5 font-display text-md font-extrabold leading-snug text-cocoa">{DEMO_TITLE}</p>
              </div>
            </Sticker>
          </Shared>

          <li className={cn("flex justify-center py-1", beat(3).className)} style={beat(3).style}>
            <VoterCrewStack crew={DEMO_CREW} lastVoteAt={null} />
          </li>

          <Shared>
            <Sticker tilt="1.5deg" tiltTo="4deg" {...beat(4)}>
              <div className="relative rounded-[length:var(--radius-lg)] border-[length:var(--border-card)] border-cocoa bg-butter p-4 pr-6 text-cocoa">
                <p className="font-body text-xs font-bold uppercase tracking-[0.06em]">Winner</p>
                <p className="mt-1 font-display text-lg font-black leading-tight">{WINNER.label}</p>
                <p className="mt-1 font-body text-sm font-bold">5 of 11 votes · ahead by 2</p>
                {/* The same rubber stamp as "Counted" on a cast vote, landing last. */}
                <span
                  className={cn(
                    "absolute -top-5 right-3 rotate-[-8deg] rounded-[length:var(--radius-md)] border-[3px] border-teal bg-card px-2.5 py-0.5 font-display text-lg font-black text-teal shadow-[inset_0_0_0_2px_var(--color-card),inset_0_0_0_4px_var(--color-teal)]",
                    seen ? "animate-[stamp-slam_0.4s_var(--ease-out)_both] motion-reduce:animate-none" : "invisible",
                  )}
                  style={seen ? { animationDelay: `${5 * STEP_MS + 150}ms` } : undefined}
                >
                  Settled
                </span>
              </div>
            </Sticker>
          </Shared>

          <Said by={JONAH} {...beat(5)}>
            fine. detroit it is
          </Said>
        </ol>
      </div>
    </figure>
  );
}

const BUBBLE =
  "rounded-[1.25rem] border-2 border-cocoa bg-card px-4 py-2.5 font-body text-base text-cocoa";

/** A friend's message: a face at the foot of the bubble and the name above it. */
function Said({
  by,
  className,
  style,
  children,
}: {
  by: Identity;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <li className={cn("flex items-end gap-2.5 pr-12 [transform-origin:bottom_left]", className)} style={style}>
      <Avatar avatar={by.avatar} size={34} alt="" className="shrink-0" />
      <div className="min-w-0">
        <p className="mx-3 mb-1 font-body text-xs font-bold text-cocoa-soft">{by.name}</p>
        <p className={cn(BUBBLE, "inline-block rounded-bl-[0.375rem]")}>
          {children}
        </p>
      </div>
    </li>
  );
}

/** Morgan's side of the chat: right-aligned, his face at the foot (left blank on a follow-up, as chats do). */
function Shared({ by, children }: { by?: Identity; children: ReactNode }) {
  return (
    <li className="flex items-end justify-end gap-2.5">
      <div className="flex min-w-0 max-w-[19rem] flex-1 flex-col items-end">
        {by && <p className="mx-3 mb-1 font-body text-xs font-bold text-cocoa-soft">{by.name}</p>}
        {children}
      </div>
      {by ? <Avatar avatar={by.avatar} size={34} alt="" className="shrink-0" /> : <span className="w-[34px] shrink-0" />}
    </li>
  );
}

/**
 * Something shared into the chat, sitting a little crooked like a sticker on the table. The outer layer
 * holds the tilt (and the scroll-driven drift, see .scroll-tilt in globals.css); the inner one pops in.
 */
function Sticker({
  tilt,
  tiltTo,
  className,
  style,
  children,
}: {
  tilt: string;
  tiltTo: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="scroll-tilt w-full" style={{ "--tilt": tilt, "--tilt-to": tiltTo } as CSSProperties}>
      <div className={className} style={style}>
        {children}
      </div>
    </div>
  );
}
