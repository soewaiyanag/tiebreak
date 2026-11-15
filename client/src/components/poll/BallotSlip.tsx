import type { Identity } from "@tiebreak/shared";
import { Avatar } from "../ui/Avatar";
import { cn } from "../../lib/cn";

interface BallotSlipProps {
  voter: Identity;
  optionLabels: string[];
  /** True only right after casting: the slip slides up and the stamp comes down. A return visit shows it at rest. */
  justCast: boolean;
}

/**
 * Your vote as a paper slip with a "Counted" stamp on it — the payoff for
 * casting. The stamp is teal, the system's color for affirmative actions,
 * so the leader card below keeps the screen's one tangerine moment.
 */
export function BallotSlip({ voter, optionLabels, justCast }: BallotSlipProps) {
  return (
    <div className={cn("relative", justCast && "animate-[slip-in_0.4s_var(--ease-out)] motion-reduce:animate-none")}>
      <div
        className={cn(
          "flex items-center gap-4 rounded-[length:var(--radius-lg)] border-[length:var(--border-card)] border-cocoa bg-card px-5 pb-5 pt-8 sm:py-5 sm:pr-36",
          justCast && "animate-[thud_0.25s_ease-out_0.55s] motion-reduce:animate-none",
        )}
      >
        <Avatar avatar={voter.avatar} size={50} alt="" />
        <div className="min-w-0">
          <p className="font-display text-md font-extrabold text-cocoa">
            {voter.name} backed {optionLabels.join(" and ")}
          </p>
          <p className="mt-0.5 font-body text-sm text-cocoa-soft">Locked in. No takebacks.</p>
        </div>
      </div>
      <span
        aria-hidden="true"
        className={cn(
          // Narrow screens: the stamp lands on the slip's top edge so long option names never sit under it.
          "absolute -top-5 right-3 rotate-[-8deg] sm:right-4 sm:top-1/2 sm:-mt-5 rounded-[length:var(--radius-md)] border-[3px] border-teal bg-card px-3 py-1 font-display text-xl font-black text-teal shadow-[inset_0_0_0_2px_var(--color-card),inset_0_0_0_4px_var(--color-teal)]",
          justCast && "animate-[stamp-slam_0.4s_var(--ease-out)_0.3s_both] motion-reduce:animate-none",
        )}
      >
        Counted
      </span>
    </div>
  );
}
