import { eq } from "drizzle-orm";
import type { CreatePollInput, Option, Poll, PollDetail, PollSummary, ReopenPollInput } from "@tiebreak/shared";
import { db } from "../db/client.js";
import { options, polls, type votes } from "../db/schema.js";
import { PollQueries } from "../common/queries.js";
import { PollState } from "../common/poll-state.js";
import { Mappers } from "../common/mappers.js";
import { HttpError } from "../common/errors.js";
import { Slug } from "../common/slug.js";
import { ResultsService } from "./results.service.js";

type PollRow = typeof polls.$inferSelect;
type VoteRow = typeof votes.$inferSelect;

/** The creator's own dashboard, poll management, and moderation actions — every method here assumes the caller already passed auth.middleware.ts. */
export class PollsService {
  /** Loads a poll and checks it belongs to `userId`. 404 either way — never reveals whether a poll id exists but belongs to someone else. */
  private static async requireOwnedPoll(userId: string, pollId: string): Promise<PollRow> {
    const poll = await PollQueries.findById(pollId);
    if (!poll || poll.creatorId !== userId) throw HttpError.notFound("Poll not found.");
    return poll;
  }

  private static async requireOwnedOption(userId: string, pollId: string, optionId: string) {
    await PollsService.requireOwnedPoll(userId, pollId);
    const option = await PollQueries.findOption(optionId);
    if (!option || option.pollId !== pollId) throw HttpError.notFound("Suggestion not found.");
    return option;
  }

  static async create(userId: string, input: CreatePollInput): Promise<Poll> {
    if (input.options.length < 2 || input.options.length > 10) {
      throw HttpError.badRequest("A poll needs 2 to 10 options.");
    }

    const [poll] = await db
      .insert(polls)
      .values({
        creatorId: userId,
        slug: Slug.generate(input.title),
        title: input.title,
        type: input.type,
        maxChoices: input.type === "multi" ? input.maxChoices : 1,
        suggestionsEnabled: input.suggestionsEnabled,
        closesAt: new Date(input.closesAt),
      })
      .returning();

    await db.insert(options).values(
      input.options.map((label, index) => ({
        pollId: poll.id,
        label,
        displayOrder: index,
        source: "creator" as const,
      })),
    );

    return Mappers.toPoll(poll);
  }

  static async list(userId: string): Promise<PollSummary[]> {
    const creatorPolls = await db.select().from(polls).where(eq(polls.creatorId, userId));
    return Promise.all(creatorPolls.map((poll) => PollsService.toSummary(poll)));
  }

  private static async toSummary(poll: PollRow): Promise<PollSummary> {
    const [pollVotes, pollOptions] = await Promise.all([PollQueries.votesFor(poll.id), PollQueries.allOptions(poll.id)]);
    return {
      id: poll.id,
      slug: poll.slug,
      title: poll.title,
      status: PollState.effectiveStatus(poll),
      closesAt: poll.closesAt.toISOString(),
      settledAt: poll.settledAt?.toISOString() ?? null,
      totalVotes: PollsService.uniqueVoterCount(pollVotes),
      pendingSuggestionCount: pollOptions.filter((o) => o.suggestionStatus === "pending").length,
    };
  }

  private static uniqueVoterCount(pollVotes: VoteRow[]): number {
    return new Set(pollVotes.map((v) => v.voterToken)).size;
  }

  static async getById(userId: string, pollId: string): Promise<PollDetail> {
    const poll = await PollsService.requireOwnedPoll(userId, pollId);
    const [pollOptions, results] = await Promise.all([PollQueries.allOptions(pollId), ResultsService.build(poll)]);
    return { ...Mappers.toPoll(poll), options: pollOptions.map(Mappers.toOption), results };
  }

  static async settle(userId: string, pollId: string): Promise<Poll> {
    await PollsService.requireOwnedPoll(userId, pollId);
    const [updated] = await db
      .update(polls)
      .set({ status: "settled", settledAt: new Date() })
      .where(eq(polls.id, pollId))
      .returning();
    return Mappers.toPoll(updated);
  }

  static async reopen(userId: string, pollId: string, input: ReopenPollInput): Promise<Poll> {
    await PollsService.requireOwnedPoll(userId, pollId);

    const closesAt = new Date(input.closesAt);
    if (Number.isNaN(closesAt.getTime()) || closesAt <= new Date()) {
      throw HttpError.badRequest("Reopening needs a new closing time in the future.");
    }

    const [updated] = await db
      .update(polls)
      .set({ status: "open", settledAt: null, closesAt })
      .where(eq(polls.id, pollId))
      .returning();
    return Mappers.toPoll(updated);
  }

  static async approveSuggestion(userId: string, pollId: string, optionId: string): Promise<Option> {
    const option = await PollsService.requireOwnedOption(userId, pollId, optionId);
    if (option.suggestionStatus !== "pending") throw HttpError.conflict("Already ruled on.");

    const [updated] = await db
      .update(options)
      .set({ suggestionStatus: "approved" })
      .where(eq(options.id, optionId))
      .returning();
    return Mappers.toOption(updated);
  }

  static async declineSuggestion(userId: string, pollId: string, optionId: string): Promise<void> {
    const option = await PollsService.requireOwnedOption(userId, pollId, optionId);
    if (option.suggestionStatus !== "pending") throw HttpError.conflict("Already ruled on.");

    await db.update(options).set({ suggestionStatus: "declined" }).where(eq(options.id, optionId));
  }

  /** Undoes a decline (the toast's "Undo" button) — back to pending, not straight to approved. */
  static async restoreSuggestion(userId: string, pollId: string, optionId: string): Promise<Option> {
    const option = await PollsService.requireOwnedOption(userId, pollId, optionId);
    if (option.suggestionStatus !== "declined") throw HttpError.conflict("Only a declined suggestion can be restored.");

    const [updated] = await db
      .update(options)
      .set({ suggestionStatus: "pending" })
      .where(eq(options.id, optionId))
      .returning();
    return Mappers.toOption(updated);
  }
}
