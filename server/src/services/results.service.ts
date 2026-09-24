import type { Identity, OptionAttribution, PollResults } from "@tiebreak/shared";
import type { polls, votes } from "../db/schema.js";
import { PollQueries } from "../common/queries.js";
import { PollState } from "../common/poll-state.js";

type PollRow = typeof polls.$inferSelect;
type VoteRow = typeof votes.$inferSelect;

function voterIdentity(vote: VoteRow): Identity {
  return {
    name: vote.voterName,
    avatar: { seed: vote.voterSeed, tint: vote.voterTint as Identity["avatar"]["tint"] },
  };
}

/**
 * Shared by the public results route and the creator's poll-detail route —
 * one query path, one shape, not duplicated. **Counts only while open** — no
 * voter identity attached to a choice — attribution only once settled
 * (spec/technical-requirements.md: "results endpoints should return counts,
 * not voter lists" while a poll is open). `voterCrew` is who voted, not what
 * they picked, so it's safe to show while still open.
 */
export class ResultsService {
  static async build(poll: PollRow, now: Date = new Date()): Promise<PollResults> {
    const status = PollState.effectiveStatus(poll, now);
    const [ballot, pollVotes] = await Promise.all([PollQueries.ballotOptions(poll.id), PollQueries.votesFor(poll.id)]);

    const tally = PollState.tallyFromVotes(pollVotes, ballot);
    const lastVote = pollVotes.at(-1) ?? null;

    const results: PollResults = {
      pollId: poll.id,
      status,
      totalVotes: tally.totalVotes,
      tallies: ballot.map((option) => ({ optionId: option.id, votes: tally.counts[option.id] ?? 0 })),
      lastVoteAt: lastVote?.castAt.toISOString() ?? null,
    };

    if (status === "open") {
      results.voterCrew = ResultsService.uniqueVoters(pollVotes);
    } else {
      results.attribution = ResultsService.attributionByOption(ballot, pollVotes);
    }

    return results;
  }

  private static uniqueVoters(pollVotes: VoteRow[]): Identity[] {
    const seenTokens = new Set<string>();
    const crew: Identity[] = [];
    for (const vote of pollVotes) {
      if (seenTokens.has(vote.voterToken)) continue;
      seenTokens.add(vote.voterToken);
      crew.push(voterIdentity(vote));
    }
    return crew;
  }

  private static attributionByOption(
    ballot: Awaited<ReturnType<typeof PollQueries.ballotOptions>>,
    pollVotes: VoteRow[],
  ): OptionAttribution[] {
    return ballot.map((option) => ({
      optionId: option.id,
      voters: pollVotes.filter((v) => v.optionId === option.id).map(voterIdentity),
    }));
  }
}
