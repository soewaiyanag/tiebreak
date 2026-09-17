import { Link } from "react-router";
import type { PollSummary } from "@tiebreak/shared";
import { Card } from "../ui/Card";
import { Pill } from "../ui/Pill";
import { formatClosingTime } from "../../lib/format";
import { cn } from "../../lib/cn";

export function PollCard({ poll, featured = false }: { poll: PollSummary; featured?: boolean }) {
  const isOpen = poll.status === "open";

  return (
    <Link to={`/app/polls/${poll.id}`} className="block focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2 rounded-[length:var(--radius-lg)]">
      <Card className={cn("transition-colors hover:bg-cream-deep/40", featured && "border-tangerine-deep")}>
        <div className="flex items-start justify-between gap-3">
          <Pill tone={isOpen ? "teal" : "neutral"}>
            {isOpen ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-teal-deep" aria-hidden="true" />
                Voting open
              </>
            ) : (
              "Settled"
            )}
          </Pill>
          {poll.pendingSuggestionCount > 0 && (
            <Pill tone="butter">
              {poll.pendingSuggestionCount} pending suggestion{poll.pendingSuggestionCount === 1 ? "" : "s"}
            </Pill>
          )}
        </div>

        <h2 className="mt-3 font-display text-md font-extrabold text-cocoa">{poll.title}</h2>

        <p className="mt-1 font-body text-sm text-cocoa-soft">
          {isOpen ? `Closes ${formatClosingTime(poll.closesAt)}` : "Voting has ended"} ·{" "}
          {poll.totalVotes === 0 ? "no votes yet" : `${poll.totalVotes} vote${poll.totalVotes === 1 ? "" : "s"}`}
        </p>
      </Card>
    </Link>
  );
}
