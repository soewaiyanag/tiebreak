import type { Identity } from "@tiebreak/shared";
import { Avatar } from "../ui/Avatar";
import { formatRelativeTime } from "../../lib/format";

/** Who voted, never what they picked while open — attribution waits for the close. */
export function VoterCrewStack({ crew, lastVoteAt }: { crew: Identity[]; lastVoteAt: string | null }) {
  if (crew.length === 0) return null;
  const shown = crew.slice(0, 5);

  return (
    <div className="flex items-center gap-3">
      <div className="flex" aria-hidden="true">
        {shown.map((voter, i) => (
          <Avatar key={i} avatar={voter.avatar} size={34} alt="" className={i > 0 ? "-ml-2.5" : ""} />
        ))}
      </div>
      <p className="font-body text-sm text-cocoa">
        <span className="font-bold">
          {crew.length} of your crew voted
        </span>
        {lastVoteAt && <span className="text-cocoa-soft"> · last one {formatRelativeTime(lastVoteAt)}</span>}
      </p>
    </div>
  );
}
