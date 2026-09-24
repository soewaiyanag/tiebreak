import { and, asc, eq, or } from "drizzle-orm";
import { db } from "../db/client.js";
import { options, polls, votes } from "../db/schema.js";

/**
 * The Drizzle queries every service needs, in one place instead of each
 * service writing its own `db.select()...` — the same lookup logic reused
 * wherever a poll/option/vote needs fetching.
 */
export class PollQueries {
  static async findBySlug(slug: string) {
    const [poll] = await db.select().from(polls).where(eq(polls.slug, slug)).limit(1);
    return poll ?? null;
  }

  static async findById(id: string) {
    const [poll] = await db.select().from(polls).where(eq(polls.id, id)).limit(1);
    return poll ?? null;
  }

  /**
   * The public ballot filter: creator options plus *approved* suggestions —
   * never pending ones. Mirrors client/src/lib/poll-options.ts's `ballotOf`
   * exactly, so a guest never even receives a pending suggestion's data.
   */
  static async ballotOptions(pollId: string) {
    return db
      .select()
      .from(options)
      .where(and(eq(options.pollId, pollId), or(eq(options.source, "creator"), eq(options.suggestionStatus, "approved"))))
      .orderBy(asc(options.displayOrder));
  }

  /** Every option including pending suggestions — the creator's own view only (routes/polls). */
  static async allOptions(pollId: string) {
    return db.select().from(options).where(eq(options.pollId, pollId)).orderBy(asc(options.displayOrder));
  }

  static async votesFor(pollId: string) {
    return db.select().from(votes).where(eq(votes.pollId, pollId)).orderBy(asc(votes.castAt));
  }

  static async findOption(optionId: string) {
    const [option] = await db.select().from(options).where(eq(options.id, optionId)).limit(1);
    return option ?? null;
  }
}
