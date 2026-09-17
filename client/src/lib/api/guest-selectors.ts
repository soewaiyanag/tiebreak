import type { Identity, Option, Poll, PollResults, PollSummary, PublicOption, PublicPoll, Vote } from "@tiebreak/shared";
import { effectiveStatus, type GuestStore } from "./guest-store";

/** Pure reads/transforms over a GuestStore — no mutation, no localStorage access. */

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "poll"}-${Math.random().toString(36).slice(2, 6)}`;
}

export function findPollBySlug(store: GuestStore, slug: string): Poll {
  const poll = store.polls.find((p) => p.slug === slug);
  if (!poll) throw new Error("Poll not found");
  return poll;
}

export function findPollById(store: GuestStore, pollId: string): Poll {
  const poll = store.polls.find((p) => p.id === pollId);
  if (!poll) throw new Error("Poll not found");
  return poll;
}

export function findOption(store: GuestStore, optionId: string): Option {
  const option = store.options.find((o) => o.id === optionId);
  if (!option) throw new Error("Option not found");
  return option;
}

export function ballotOptions(store: GuestStore, poll: Poll): Option[] {
  return store.options
    .filter((o) => o.pollId === poll.id && (o.source === "creator" || o.suggestionStatus === "approved"))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Mirrors what a real results endpoint would compute: counts only while
 * open, attribution once settled (spec/technical-requirements.md).
 */
export function computeResults(poll: Poll, store: GuestStore): PollResults {
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

export function toPublicPoll(poll: Poll, store: GuestStore): PublicPoll {
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

export function toPollSummary(poll: Poll, store: GuestStore): PollSummary {
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
