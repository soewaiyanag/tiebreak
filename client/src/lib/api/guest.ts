import type {
  CastVoteInput,
  CastVoteResult,
  CreatePollInput,
  Identity,
  Option,
  Poll,
  PollDetail,
  PollResults,
  PollSummary,
  PublicOption,
  PublicPoll,
  ReopenPollInput,
  SuggestOptionInput,
  Vote,
} from "@tiebreak/shared";
import type { PollsApi } from "./types";
import { effectiveStatus, getOrSeedStore, onStoreChange, save, type GuestStore } from "./guest-store";

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "poll"}-${Math.random().toString(36).slice(2, 6)}`;
}

function findPollBySlug(store: GuestStore, slug: string): Poll {
  const poll = store.polls.find((p) => p.slug === slug);
  if (!poll) throw new Error("Poll not found");
  return poll;
}

function findPollById(store: GuestStore, pollId: string): Poll {
  const poll = store.polls.find((p) => p.id === pollId);
  if (!poll) throw new Error("Poll not found");
  return poll;
}

function findOption(store: GuestStore, optionId: string): Option {
  const option = store.options.find((o) => o.id === optionId);
  if (!option) throw new Error("Option not found");
  return option;
}

function ballotOptions(store: GuestStore, poll: Poll): Option[] {
  return store.options
    .filter((o) => o.pollId === poll.id && (o.source === "creator" || o.suggestionStatus === "approved"))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

function computeResults(poll: Poll, store: GuestStore): PollResults {
  const status = effectiveStatus(poll);
  const pollVotes = store.votes.filter((v) => v.pollId === poll.id);
  const options = ballotOptions(store, poll);

  const tallies = options.map((o) => ({
    optionId: o.id,
    votes: pollVotes.filter((v) => v.optionId === o.id).length,
  }));

  const uniqueVoters = new Set(pollVotes.map((v) => v.voterToken)).size;
  const lastVote = pollVotes.reduce<Vote | null>(
    (latest, v) => (!latest || v.castAt > latest.castAt ? v : latest),
    null,
  );

  const results: PollResults = {
    pollId: poll.id,
    status,
    totalVotes: uniqueVoters,
    tallies,
    lastVoteAt: lastVote?.castAt ?? null,
  };

  if (status === "open") {
    const seenTokens = new Set<string>();
    const crew: Identity[] = [];
    for (const v of pollVotes) {
      if (seenTokens.has(v.voterToken)) continue;
      seenTokens.add(v.voterToken);
      crew.push(v.voter);
    }
    results.voterCrew = crew;
  } else {
    results.attribution = options.map((o) => ({
      optionId: o.id,
      voters: pollVotes.filter((v) => v.optionId === o.id).map((v) => v.voter),
    }));
  }

  return results;
}

function toPublicPoll(poll: Poll, store: GuestStore): PublicPoll {
  const options: PublicOption[] = ballotOptions(store, poll).map((o) => ({
    id: o.id,
    label: o.label,
    source: o.source,
    suggestedBy: o.suggestedBy,
  }));

  return {
    id: poll.id,
    slug: poll.slug,
    title: poll.title,
    type: poll.type,
    maxChoices: poll.maxChoices,
    suggestionsEnabled: poll.suggestionsEnabled,
    status: effectiveStatus(poll),
    closesAt: poll.closesAt,
    options,
  };
}

function toPollSummary(poll: Poll, store: GuestStore): PollSummary {
  const pollVotes = store.votes.filter((v) => v.pollId === poll.id);
  return {
    id: poll.id,
    slug: poll.slug,
    title: poll.title,
    status: effectiveStatus(poll),
    closesAt: poll.closesAt,
    settledAt: poll.settledAt,
    totalVotes: new Set(pollVotes.map((v) => v.voterToken)).size,
    pendingSuggestionCount: store.options.filter((o) => o.pollId === poll.id && o.suggestionStatus === "pending")
      .length,
  };
}

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
