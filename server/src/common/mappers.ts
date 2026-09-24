import type { AvatarTint, Identity, Option as ApiOption, Poll as ApiPoll } from "@tiebreak/shared";
import type { options, polls } from "../db/schema.js";
import { PollState } from "./poll-state.js";

type PollRow = typeof polls.$inferSelect;
type OptionRow = typeof options.$inferSelect;

/**
 * DB rows store an identity as three flat columns (name/seed/tint) — the API
 * contract nests them as `{ name, avatar: { seed, tint } }`. This is the one
 * place that translation happens, so every service builds the same shape
 * the same way.
 */
export class Mappers {
  static toPoll(poll: PollRow, now: Date = new Date()): ApiPoll {
    return {
      id: poll.id,
      slug: poll.slug,
      title: poll.title,
      type: poll.type,
      maxChoices: poll.maxChoices,
      suggestionsEnabled: poll.suggestionsEnabled,
      status: PollState.effectiveStatus(poll, now),
      createdAt: poll.createdAt.toISOString(),
      closesAt: poll.closesAt.toISOString(),
      settledAt: poll.settledAt?.toISOString() ?? null,
      parentPollId: poll.parentPollId,
    };
  }

  static toOption(option: OptionRow): ApiOption {
    return {
      id: option.id,
      pollId: option.pollId,
      label: option.label,
      displayOrder: option.displayOrder,
      source: option.source,
      suggestionStatus: option.suggestionStatus,
      suggestedBy: Mappers.suggestedByIdentity(option),
    };
  }

  static suggestedByIdentity(option: OptionRow): Identity | null {
    if (!option.suggestedByName || !option.suggestedBySeed || !option.suggestedByTint) return null;
    return {
      name: option.suggestedByName,
      avatar: { seed: option.suggestedBySeed, tint: option.suggestedByTint as AvatarTint },
    };
  }
}
