import type { polls, options, votes } from "../db/schema.js";

type Poll = typeof polls.$inferSelect;
type Option = typeof options.$inferSelect;
type Vote = typeof votes.$inferSelect;

export interface Tally {
  /** optionId -> vote count, for every option passed in (including 0-vote ones) */
  counts: Record<string, number>;
  totalVotes: number;
  /** optionIds tied for the highest count — length > 1 means a tie for first */
  leaders: string[];
  /** margin between the leader(s) and the next-highest count (0 if only one option) */
  aheadBy: number;
}

/**
 * The poll state machine's two pure rules — no DB access, easy to unit test
 * on their own. Every service calls these instead of trusting a stored
 * column or re-deriving the logic locally.
 */
export class PollState {
  /**
   * Settle-at-read-time. technical-requirements.md says a closed poll must
   * reject a vote "no matter what the client sends" — the stored `status`
   * column only flips to "settled" when the settle route runs, but a poll
   * whose `closesAt` has already passed is *also* settled even if nobody's
   * called it yet. No cron job flips the row at the exact closing instant
   * (extra infrastructure, and a race window between "time's up" and "the
   * job ran") — every read computes the true status instead.
   */
  static effectiveStatus(poll: Poll, now: Date = new Date()): "open" | "settled" {
    if (poll.status === "settled") return "settled";
    return poll.closesAt <= now ? "settled" : "open";
  }

  /**
   * Derive results, never store them. data/README.md's "derive counts from
   * votes" rule and the small-n honesty requirement (guidance/patterns.md,
   * brand-kit data-viz rules) both mean a vote count is never a column
   * anywhere — it's always computed from the `votes` rows at request time.
   * `leaders.length > 1` is exactly the "tie" case the reveal's tie state
   * branches on — there's no separate boolean for it on purpose.
   */
  static tallyFromVotes(votesForPoll: Vote[], optionsForPoll: Option[]): Tally {
    const counts: Record<string, number> = {};
    for (const option of optionsForPoll) counts[option.id] = 0;
    for (const vote of votesForPoll) {
      if (vote.optionId in counts) counts[vote.optionId]++;
    }

    const maxCount = Math.max(0, ...Object.values(counts));
    const leaders = Object.entries(counts)
      .filter(([, count]) => count === maxCount && maxCount > 0)
      .map(([optionId]) => optionId);

    const runnerUpCount = Math.max(0, ...Object.values(counts).filter((count) => count < maxCount));

    return {
      counts,
      totalVotes: new Set(votesForPoll.map((v) => v.voterToken)).size,
      leaders,
      aheadBy: maxCount > 0 ? maxCount - runnerUpCount : 0,
    };
  }
}
