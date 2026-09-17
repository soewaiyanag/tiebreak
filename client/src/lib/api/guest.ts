import type { CastVoteInput, CastVoteResult, CreatePollInput, Option, Poll, PollDetail, ReopenPollInput, SuggestOptionInput } from "@tiebreak/shared";
import type { PollsApi } from "./types";
import { effectiveStatus, getOrSeedStore, onStoreChange, save } from "./guest-store";
import {
  computeResults,
  findOption,
  findPollById,
  findPollBySlug,
  slugify,
  toPollSummary,
  toPublicPoll,
} from "./guest-selectors";

/**
 * A full client-side simulation of the product, re-implementing the state
 * machine rules (spec/technical-requirements.md) against localStorage — see
 * guest-store.ts for persistence/seeding and guest-selectors.ts for the pure
 * reads this delegates to. This is what makes the app demoable and every
 * screen buildable before any backend route exists.
 */
export const guestApi: PollsApi = {
  async listPolls() {
    const store = await getOrSeedStore();
    return store.polls
      .map((p) => toPollSummary(p, store))
      .sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime());
  },

  async getPoll(pollId) {
    const store = await getOrSeedStore();
    const poll = findPollById(store, pollId);
    const options = store.options.filter((o) => o.pollId === poll.id).sort((a, b) => a.displayOrder - b.displayOrder);
    const detail: PollDetail = { ...poll, status: effectiveStatus(poll), options, results: computeResults(poll, store) };
    return detail;
  },

  async createPoll(input: CreatePollInput) {
    const store = await getOrSeedStore();
    const id = crypto.randomUUID();
    const poll: Poll = {
      id,
      slug: slugify(input.title),
      title: input.title,
      type: input.type,
      maxChoices: input.maxChoices,
      suggestionsEnabled: input.suggestionsEnabled,
      status: "open",
      createdAt: new Date().toISOString(),
      closesAt: input.closesAt,
      settledAt: null,
      parentPollId: null,
    };
    store.polls.push(poll);
    input.options.forEach((label, index) => {
      store.options.push({
        id: crypto.randomUUID(),
        pollId: id,
        label,
        displayOrder: index,
        source: "creator",
        suggestionStatus: null,
        suggestedBy: null,
      });
    });
    save(store);
    return poll;
  },

  async getPublicPoll(slug) {
    const store = await getOrSeedStore();
    return toPublicPoll(findPollBySlug(store, slug), store);
  },

  async getResults(slug) {
    const store = await getOrSeedStore();
    return computeResults(findPollBySlug(store, slug), store);
  },

  subscribeToResults(slug, onUpdate) {
    let cancelled = false;
    const push = () => {
      void getOrSeedStore().then((store) => {
        if (!cancelled) onUpdate(computeResults(findPollBySlug(store, slug), store));
      });
    };
    push();
    const unsubscribe = onStoreChange(push);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  },

  async castVote(slug, input: CastVoteInput) {
    const store = await getOrSeedStore();
    const poll = findPollBySlug(store, slug);

    const alreadyVoted = store.votes.some((v) => v.pollId === poll.id && v.voterToken === input.voterToken);
    if (alreadyVoted) return { alreadyVoted: true, results: computeResults(poll, store) };

    if (effectiveStatus(poll) !== "open") throw new Error("This poll has closed.");

    const castAt = new Date().toISOString();
    for (const optionId of input.optionIds) {
      store.votes.push({
        id: crypto.randomUUID(),
        pollId: poll.id,
        optionId,
        voter: { name: input.voterName, avatar: input.voterAvatar },
        voterToken: input.voterToken,
        castAt,
      });
    }
    save(store);

    const result: CastVoteResult = { alreadyVoted: false, results: computeResults(poll, store) };
    return result;
  },

  async suggestOption(slug, input: SuggestOptionInput) {
    const store = await getOrSeedStore();
    const poll = findPollBySlug(store, slug);
    if (!poll.suggestionsEnabled) throw new Error("Suggestions are turned off for this poll.");
    if (effectiveStatus(poll) !== "open") throw new Error("This poll has closed.");

    const existingCount = store.options.filter((o) => o.pollId === poll.id).length;
    const option: Option = {
      id: crypto.randomUUID(),
      pollId: poll.id,
      label: input.label,
      displayOrder: existingCount,
      source: "suggestion",
      suggestionStatus: "pending",
      suggestedBy: input.suggestedBy,
    };
    store.options.push(option);
    save(store);
    return option;
  },

  async approveSuggestion(pollId, optionId) {
    const store = await getOrSeedStore();
    findPollById(store, pollId);
    const option = findOption(store, optionId);
    option.suggestionStatus = "approved";
    save(store);
    return option;
  },

  async declineSuggestion(pollId, optionId) {
    const store = await getOrSeedStore();
    findPollById(store, pollId);
    const option = findOption(store, optionId);
    option.suggestionStatus = "declined";
    save(store);
  },

  async restoreSuggestion(pollId, optionId) {
    const store = await getOrSeedStore();
    findPollById(store, pollId);
    const option = findOption(store, optionId);
    option.suggestionStatus = "pending";
    save(store);
    return option;
  },

  async settlePoll(pollId) {
    const store = await getOrSeedStore();
    const poll = findPollById(store, pollId);
    poll.status = "settled";
    poll.settledAt = new Date().toISOString();
    save(store);
    return poll;
  },

  async reopenPoll(pollId, input: ReopenPollInput) {
    const store = await getOrSeedStore();
    const poll = findPollById(store, pollId);
    poll.status = "open";
    poll.settledAt = null;
    poll.closesAt = input.closesAt;
    save(store);
    return poll;
  },
};

