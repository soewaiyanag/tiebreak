import { z } from "zod";
import type { CastVoteInput, CreatePollInput, ReopenPollInput, SuggestOptionInput } from "@tiebreak/shared";

/**
 * Request-body contracts, checked at the trust boundary before any service
 * runs (middleware/validate.middleware.ts). `satisfies z.ZodType<...>` ties
 * each schema to its @tiebreak/shared type, so the client's contract and the
 * server's validation can't silently drift apart.
 *
 * Limits are generous on purpose: the client has no maxLength on its inputs,
 * so these exist to stop abuse (a 5 MB poll title), not to reject a long name.
 */

const text = (max: number) => z.string().trim().min(1, "Can't be empty.").max(max);
const isoDate = z.iso.datetime({ offset: true, error: "Must be an ISO 8601 date-time." });

const avatar = z.object({
  seed: text(100),
  tint: z.enum(["f8c9b9", "cbe2d8", "f6e0a4", "e3d2f2"]),
});

const identity = z.object({ name: text(60), avatar });

export const createPollSchema = z.object({
  title: text(200),
  type: z.enum(["single", "multi"]),
  maxChoices: z.int().min(1).max(10),
  suggestionsEnabled: z.boolean(),
  closesAt: isoDate,
  options: z.array(text(120)).min(2, "A poll needs 2 to 10 options.").max(10, "A poll needs 2 to 10 options."),
}) satisfies z.ZodType<CreatePollInput>;

export const reopenPollSchema = z.object({
  closesAt: isoDate.refine((s) => new Date(s) > new Date(), "Reopening needs a new closing time in the future."),
}) satisfies z.ZodType<ReopenPollInput>;

export const castVoteSchema = z.object({
  voterName: text(60),
  voterAvatar: avatar,
  voterToken: text(100),
  optionIds: z
    .array(z.uuid())
    .min(1, "Pick at least one option.")
    .max(10)
    // A duplicate would hit votes_poll_voter_option_unique as a 500; say so as a 400 instead.
    .refine((ids) => new Set(ids).size === ids.length, "Each option can only be picked once."),
}) satisfies z.ZodType<CastVoteInput>;

export const suggestOptionSchema = z.object({
  label: text(120),
  suggestedBy: identity,
}) satisfies z.ZodType<SuggestOptionInput>;
