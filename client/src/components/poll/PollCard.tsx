import { Link } from "react-router";
import type { PollSummary } from "@tiebreak/shared";
import { Card } from "../ui/Card";
import { Pill } from "../ui/Pill";
import { StatusSticker } from "./StatusSticker";
import { cn } from "../../lib/cn";

export function PollCard({ poll, featured = false }: { poll: PollSummary; featured?: boolean }) {
  const isOpen = poll.status === "open";

  return (
    <Link
      to={`/app/polls/${poll.id}`}
      className="piece block rounded-[length:var(--radius-lg)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2"
    >
      <Card className={cn(featured && "border-tangerine-deep")}>
        <div className="flex items-start justify-between gap-3">
          {isOpen ? <StatusSticker state="open" closesAt={poll.closesAt} /> : <StatusSticker state="settled" />}
          {poll.pendingSuggestionCount > 0 && (
            <Pill tone="butter">
              {poll.pendingSuggestionCount} pending suggestion{poll.pendingSuggestionCount === 1 ? "" : "s"}
            </Pill>
          )}
        </div>

        <h2 className="mt-3 font-display text-md font-extrabold text-cocoa">{poll.title}</h2>

        <p className="mt-1 font-body text-sm text-cocoa-soft">
          {poll.totalVotes === 0 ? "No votes yet" : `${poll.totalVotes} vote${poll.totalVotes === 1 ? "" : "s"}`}
        </p>
      </Card>
    </Link>
  );
}
