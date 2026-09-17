import type {
  CastVoteInput,
  CastVoteResult,
  CreatePollInput,
  Option,
  Poll,
  PollDetail,
  PollResults,
  PollSummary,
  PublicPoll,
  ReopenPollInput,
  SuggestOptionInput,
} from "@tiebreak/shared";

/**
 * Every page talks to poll data through this interface, never through fetch()
 * or localStorage directly. `remoteApi` implements it against the real
 * Express API; `guestApi` implements it entirely client-side so the product
 * is fully demoable before the backend exists. See client/src/lib/api/index.ts
 * for which one a page actually gets (decided by session mode).
 */
export interface PollsApi {
  listPolls(): Promise<PollSummary[]>;
  getPoll(pollId: string): Promise<PollDetail>;
  createPoll(input: CreatePollInput): Promise<Poll>;

  getPublicPoll(slug: string): Promise<PublicPoll>;
  getResults(slug: string): Promise<PollResults>;
  /** Calls `onUpdate` whenever results change; call the returned function to stop listening. */
  subscribeToResults(slug: string, onUpdate: (results: PollResults) => void): () => void;

  castVote(slug: string, input: CastVoteInput): Promise<CastVoteResult>;
  suggestOption(slug: string, input: SuggestOptionInput): Promise<Option>;

  approveSuggestion(pollId: string, optionId: string): Promise<Option>;
  declineSuggestion(pollId: string, optionId: string): Promise<void>;
  restoreSuggestion(pollId: string, optionId: string): Promise<Option>;

  settlePoll(pollId: string): Promise<Poll>;
  reopenPoll(pollId: string, input: ReopenPollInput): Promise<Poll>;
}
