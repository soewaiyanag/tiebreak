import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { Identity } from "@tiebreak/shared";
import { SkipLink } from "./SkipLink";
import { Logo } from "./Logo";
import { Avatar } from "../ui/Avatar";
import { LeaderCard } from "../poll/LeaderCard";
import { StatusSticker } from "../poll/StatusSticker";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** The "switch to the other form" line under the form. */
  footer: ReactNode;
}

/**
 * Log in and Sign up: the form on the left, and on wide screens a lamplit
 * cocoa table on the right with a live-looking poll on it, so the page
 * says what Tiebreak does instead of being two fields on an empty page.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh bg-cream">
      <SkipLink />
      <div className="mx-auto grid min-h-dvh max-w-page gap-12 px-4 py-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16 lg:py-6">
        <div className="flex flex-col">
          <header>
            <Link
              to="/"
              className="inline-block rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2"
            >
              <Logo />
            </Link>
          </header>
          <main id="main" className="my-auto py-12">
            <h1 className="text-balance font-display text-[2.5rem] font-black leading-[var(--leading-display)] tracking-[-0.02em] text-cocoa [text-shadow:0.045em_0.045em_0_var(--color-butter)]">
              {title}
            </h1>
            <p className="mt-3 max-w-[34ch] font-body text-base text-cocoa-soft">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 border-t-[length:var(--border-divider)] border-dashed border-cream-deep pt-6 font-body text-sm text-cocoa-soft">
              {footer}
            </div>
          </main>
        </div>
        <TableShowcase />
      </div>
    </div>
  );
}

const crew: Identity[] = ["Priya", "Jonah", "Ada", "Sam", "Kai"].map((name, i) => ({
  name,
  avatar: { seed: name, tint: (["f8c9b9", "cbe2d8", "f6e0a4", "e3d2f2", "cbe2d8"] as const)[i] },
}));

/** Decorative: the same poll pieces the app uses, set on the table at a slight angle. */
function TableShowcase() {
  // Fixed at first render so the sticker reads like a poll mid-race, then ticks down like a real one.
  const [closesAt] = useState(() => new Date(Date.now() + (2 * 60 + 14) * 60_000).toISOString());

  return (
    <aside
      aria-hidden="true"
      className="relative hidden overflow-hidden rounded-[2rem] border-[length:var(--border-card)] border-cocoa bg-cocoa p-12 lg:flex lg:flex-col lg:justify-center"
    >
      <div className="mx-auto w-full max-w-md">
        <StatusSticker state="open" closesAt={closesAt} />
        <p className="mt-4 text-balance font-display text-[2.25rem] font-black leading-[var(--leading-display)] tracking-[-0.02em] text-cream-bright">
          Pizza night: what are we ordering?
        </p>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex">
            {crew.map((voter, i) => (
              <Avatar key={voter.name} avatar={voter.avatar} size={34} alt="" className={i > 0 ? "-ml-2.5" : ""} />
            ))}
          </div>
          <span className="font-body text-sm font-bold text-cream-bright">11 of your crew voted</span>
        </div>
        <div className="mt-6 -rotate-2">
          <LeaderCard
            option={{ id: "detroit", label: "Detroit-style from Emmy's", suggestedBy: crew[0] }}
            tally={{ optionId: "detroit", votes: 5, percentage: 45, isLeader: true, packBarWidth: 100 }}
            totalVotes={11}
            aheadBy={2}
            isTie={false}
            useSegmentedTally
          />
        </div>
        <p className="mt-10 max-w-[38ch] font-body text-base text-cream-bright/80">
          Your crew taps the link, picks a face and votes. No account, no app, no chasing anyone.
        </p>
      </div>
    </aside>
  );
}
