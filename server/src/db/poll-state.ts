import type { polls, options, votes } from "./schema.js";

type Poll = typeof polls.$inferSelect;
type Option = typeof options.$inferSelect;
type Vote = typeof votes.$inferSelect;

// TODO(you) — concept: settle-at-read-time.
//
// Why Tiebreak needs this: technical-requirements.md says a closed poll must
// reject a vote "no matter what the client sends." The stored `status`
// column only flips to "settled" when someone explicitly calls the settle
// endpoint (Phase 5) — but a poll whose `closesAt` has already passed is
// *also* settled, even if nobody's hit that endpoint yet. Every place that
// checks "can this poll still be voted on" needs the real answer, not just
// the column.
//
// The concept: no cron job flips the row at the exact closing instant —
// that's extra infrastructure and a race window (a vote landing in the gap
// between "time's up" and "the job ran"). Instead, compute the true status
// on every read: settled if the column already says so, OR if `now` is at
// or past `closesAt`.
//
// Shape: return the stored status early if it's already "settled"; otherwise
// compare `now` against `poll.closesAt`.
export function effectiveStatus(poll: Poll, now: Date): "open" | "settled" {
  if (poll.status === "settled") return "settled";
  return poll.closesAt <= now ? "settled" : "open";
}

export interface Tally {
  /** optionId -> vote count, for every option passed in (including 0-vote ones) */
  counts: Record<string, number>;
  totalVotes: number;
  /** optionIds tied for the highest count — length > 1 means a tie for first */
  leaders: string[];
  /** margin between the leader(s) and the next-highest count (0 if only one option) */
  aheadBy: number;
}

// TODO(you) — concept: derive results, never store them.
//
// Why Tiebreak needs this: `data/README.md`'s "derive counts from votes"
// rule and the small-n honesty requirement (guidance/patterns.md,
// brand-kit data-viz rules) both mean a vote count is never a column
// anywhere — it's always computed from the `votes` rows at request time.
// This function is also where tie detection lives, which the reveal screen
// and the Sudden Death differentiator both depend on.
//
// The concept: fold `votesForPoll` into per-option counts (starting every
// option in `optionsForPoll` at 0, so unvoted options still appear), find
// the max count, collect every option at that max into `leaders`, and
// compute `aheadBy` as the gap between the max and the next-highest count.
//
// Shape: `leaders.length > 1` is exactly the "tie" case Sudden Death and the
// reveal's tie state both branch on — don't compute a separate boolean for it.
export function tallyFromVotes(votesForPoll: Vote[], optionsForPoll: Option[]): Tally {
  // TODO(you): implement
}
