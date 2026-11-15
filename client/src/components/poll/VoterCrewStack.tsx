import type { Identity } from "@tiebreak/shared";
import { Avatar } from "../ui/Avatar";
import { formatRelativeTime } from "../../lib/format";
import { cn } from "../../lib/cn";

interface VoterCrewStackProps {
  crew: Identity[];
  lastVoteAt: string | null;
  /** The viewing voter, once they've voted: shown first, on top, and counted as "you". */
  you?: Identity;
  /** True right after casting: your avatar drops onto the front of the stack. */
  youJustJoined?: boolean;
}

const sameVoter = (a: Identity, b: Identity) =>
  a.name === b.name && a.avatar.seed === b.avatar.seed && a.avatar.tint === b.avatar.tint;

/** Who voted, never what they picked while open — attribution waits for the close. */
export function VoterCrewStack({ crew, lastVoteAt, you, youJustJoined = false }: VoterCrewStackProps) {
  // The server's crew already includes you after your vote; take one match out so you aren't shown twice.
  const yourIndex = you ? crew.findIndex((voter) => sameVoter(voter, you)) : -1;
  const others = yourIndex === -1 ? crew : crew.filter((_, i) => i !== yourIndex);
  if (!you && others.length === 0) return null;

  const shown = others.slice(0, you ? 4 : 5);
  const summary = !you
    ? `${others.length} of your crew voted`
    : others.length === 0
      ? "You're the first one in"
      : `You and ${others.length} other${others.length === 1 ? "" : "s"} voted`;

  return (
    <div className="flex items-center gap-3">
      <div className="flex" aria-hidden="true">
        {you && (
          <Avatar
            avatar={you.avatar}
            size={34}
            alt=""
            className={cn(
              "relative z-10",
              youJustJoined && "animate-[drop-in_0.5s_var(--ease-out)_0.8s_both] motion-reduce:animate-none",
            )}
          />
        )}
        {shown.map((voter, i) => (
          <Avatar key={i} avatar={voter.avatar} size={34} alt="" className={you || i > 0 ? "-ml-2.5" : ""} />
        ))}
      </div>
      <p className="font-body text-sm text-cocoa">
        <span className="font-bold">{summary}</span>
        {lastVoteAt && <span className="text-cocoa-soft"> · last one {formatRelativeTime(lastVoteAt)}</span>}
      </p>
    </div>
  );
}
