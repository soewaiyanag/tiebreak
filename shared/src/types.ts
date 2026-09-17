/**
 * The API contract between client/ and server/. Both workspaces import from
 * here so the shapes can't drift. Mirrors server/src/db/schema.ts's enums —
 * see that file for the state-machine rationale behind each one.
 */

export type PollType = "single" | "multi";
export type PollStatus = "open" | "settled";
export type OptionSource = "creator" | "suggestion";
export type SuggestionStatus = "pending" | "approved" | "declined";

/** DiceBear "micah" background tints, hex without "#" — see guidance/brand-kit.md. */
export type AvatarTint = "f8c9b9" | "cbe2d8" | "f6e0a4" | "e3d2f2";

export interface Avatar {
  seed: string;
  tint: AvatarTint;
}

export interface Identity {
  name: string;
  avatar: Avatar;
}

export interface Poll {
  id: string;
  slug: string;
  title: string;
  type: PollType;
  maxChoices: number;
  suggestionsEnabled: boolean;
  status: PollStatus;
  createdAt: string;
  closesAt: string;
  settledAt: string | null;
  parentPollId: string | null;
}

export interface Option {
  id: string;
  pollId: string;
  label: string;
  displayOrder: number;
  source: OptionSource;
  suggestionStatus: SuggestionStatus | null;
  suggestedBy: Identity | null;
}

/** One row per vote cast. Never exposed with voter identity while a poll is open. */
export interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  voter: Identity;
  voterToken: string;
  castAt: string;
}

/**
 * Results for one poll. `attribution` and `voterCrew` are omitted while the
 * poll is open (technical-requirements.md: "results endpoints should return
 * counts, not voter lists" while open) and populated once settled.
 */
export interface OptionTally {
  optionId: string;
  votes: number;
}

export interface OptionAttribution {
  optionId: string;
  voters: Identity[];
}

export interface PollResults {
  pollId: string;
  status: PollStatus;
  totalVotes: number;
  tallies: OptionTally[];
  /** Who has voted (not what they picked) — shown while open, e.g. the voter-crew stack. */
  voterCrew?: Identity[];
  /** Who backed each option — only present once the poll is settled. */
  attribution?: OptionAttribution[];
  lastVoteAt: string | null;
}

/** The creator's dashboard row — cheaper than a full PollDetail per poll. */
export interface PollSummary {
  id: string;
  slug: string;
  title: string;
  status: PollStatus;
  closesAt: string;
  settledAt: string | null;
  totalVotes: number;
  pendingSuggestionCount: number;
}

export interface PollDetail extends Poll {
  options: Option[];
  results: PollResults;
}

/** The public ballot — pending suggestions are never included (not on the ballot yet). */
export interface PublicOption {
  id: string;
  label: string;
  source: OptionSource;
  suggestedBy: Identity | null;
}

export interface PublicPoll {
  id: string;
  slug: string;
  title: string;
  type: PollType;
  maxChoices: number;
  suggestionsEnabled: boolean;
  status: PollStatus;
  closesAt: string;
  options: PublicOption[];
}

// ---- Request payloads ----

export interface CreatePollInput {
  title: string;
  type: PollType;
  maxChoices: number;
  suggestionsEnabled: boolean;
  closesAt: string;
  options: string[]; // 2-10 labels
}

export interface CastVoteInput {
  voterName: string;
  voterAvatar: Avatar;
  voterToken: string;
  optionIds: string[]; // length 1 for single, up to maxChoices for multi
}

export interface CastVoteResult {
  alreadyVoted: boolean;
  results: PollResults;
}

export interface SuggestOptionInput {
  label: string;
  suggestedBy: Identity;
}

export interface ReopenPollInput {
  /** Reopening requires a new closing time — see TODO.md "Product rules I decided". */
  closesAt: string;
}
