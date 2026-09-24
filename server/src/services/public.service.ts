import { and, eq } from "drizzle-orm";
import type { CastVoteInput, CastVoteResult, Option, PublicOption, PublicPoll, SuggestOptionInput } from "@tiebreak/shared";
import { db } from "../db/client.js";
import { options, votes, type polls } from "../db/schema.js";
import { PollQueries } from "../common/queries.js";
import { PollState } from "../common/poll-state.js";
import { Mappers } from "../common/mappers.js";
import { HttpError } from "../common/errors.js";
import { ResultsService } from "./results.service.js";

type PollRow = typeof polls.$inferSelect;

/** Everything the no-account voter can do — GET the ballot/results, POST a vote or a suggestion. No auth anywhere in this file, on purpose (spec: "vote and results pages are public by link"). */
export class PublicService {
  static async requirePoll(slug: string): Promise<PollRow> {
    const poll = await PollQueries.findBySlug(slug);
    if (!poll) throw HttpError.notFound("That poll's gone quiet.");
    return poll;
  }

  static async getPublicPoll(slug: string): Promise<PublicPoll> {
    const poll = await PublicService.requirePoll(slug);
    const ballot = await PollQueries.ballotOptions(poll.id);
    const publicOptions: PublicOption[] = ballot.map((o) => {
      const { id, label, source, suggestedBy } = Mappers.toOption(o);
      return { id, label, source, suggestedBy };
    });

    return {
      id: poll.id,
      slug: poll.slug,
      title: poll.title,
      type: poll.type,
      maxChoices: poll.maxChoices,
      suggestionsEnabled: poll.suggestionsEnabled,
      status: PollState.effectiveStatus(poll),
      closesAt: poll.closesAt.toISOString(),
      options: publicOptions,
    };
  }

  static async getResults(slug: string) {
    return ResultsService.build(await PublicService.requirePoll(slug));
  }

  /**
   * Idempotent per voterToken, checked at the application level (not just
   * the DB's compound unique constraint) because a `multi` ballot inserts
   * one row per selected option for the same voter — see schema.ts's
   * votes_poll_voter_option_unique for why the constraint alone can't tell
   * "this voter already has a ballot in" from "this exact
   * (poll, voter, option) row already exists".
   */
  static async castVote(slug: string, input: CastVoteInput): Promise<CastVoteResult> {
    const poll = await PublicService.requirePoll(slug);
    const { voterName, voterAvatar, voterToken, optionIds } = input;

    const [existingVote] = await db
      .select({ id: votes.id })
      .from(votes)
      .where(and(eq(votes.pollId, poll.id), eq(votes.voterToken, voterToken)))
      .limit(1);

    if (existingVote) {
      return { alreadyVoted: true, results: await ResultsService.build(poll) };
    }

    if (PollState.effectiveStatus(poll) !== "open") {
      throw HttpError.conflict("This poll has closed.");
    }
    if (optionIds.length === 0 || optionIds.length > poll.maxChoices) {
      throw HttpError.badRequest(`Pick between 1 and ${poll.maxChoices} options.`);
    }

    await db.insert(votes).values(
      optionIds.map((optionId) => ({
        pollId: poll.id,
        optionId,
        voterName,
        voterSeed: voterAvatar.seed,
        voterTint: voterAvatar.tint,
        voterToken,
      })),
    );

    const results = await ResultsService.build(poll);
    return { alreadyVoted: false, results };
  }

  static async suggestOption(slug: string, input: SuggestOptionInput): Promise<Option> {
    const poll = await PublicService.requirePoll(slug);
    if (!poll.suggestionsEnabled) throw HttpError.forbidden("Suggestions are turned off for this poll.");
    if (PollState.effectiveStatus(poll) !== "open") throw HttpError.conflict("This poll has closed.");

    const existingCount = await db.$count(options, eq(options.pollId, poll.id));

    const [inserted] = await db
      .insert(options)
      .values({
        pollId: poll.id,
        label: input.label,
        displayOrder: existingCount,
        source: "suggestion",
        suggestionStatus: "pending",
        suggestedByName: input.suggestedBy.name,
        suggestedBySeed: input.suggestedBy.avatar.seed,
        suggestedByTint: input.suggestedBy.avatar.tint,
      })
      .returning();

    return Mappers.toOption(inserted);
  }
}
