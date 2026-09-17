import type { OptionTally } from "@tiebreak/shared";

/**
 * Turns raw vote counts into everything the results UI needs to draw itself
 * honestly (guidance/brand-kit.md "Data Viz Rules"): who's leading, by how
 * much, whether it's a tie, and bar widths relative to the leader rather
 * than to 100%. Endpoints only ever return counts — this presentation layer
 * is what both guestApi and remoteApi-backed pages share.
 */

export interface OptionPresentation {
  optionId: string;
  votes: number;
  /** Rounded, no decimals — "45.45%" is false precision at 11 voters. */
  percentage: number;
  isLeader: boolean;
  /** 0-100, relative to the leader's vote count, not to total votes. */
  packBarWidth: number;
}

export interface TallyPresentation {
  totalVotes: number;
  /** optionIds tied for first place — length > 1 means a tie. */
  leaders: string[];
  isTie: boolean;
  aheadBy: number;
  options: OptionPresentation[];
  /** Past this many voters, per-voter ticks degrade to counts + bars only. */
  useSegmentedTally: boolean;
}

const SEGMENTED_TALLY_THRESHOLD = 20;

export function presentTally(tallies: OptionTally[]): TallyPresentation {
  const totalVotes = tallies.reduce((sum, t) => sum + t.votes, 0);
  const maxVotes = tallies.reduce((max, t) => Math.max(max, t.votes), 0);
  const leaders = totalVotes === 0 ? [] : tallies.filter((t) => t.votes === maxVotes).map((t) => t.optionId);
  const runnerUpVotes = tallies
    .filter((t) => t.votes < maxVotes)
    .reduce((max, t) => Math.max(max, t.votes), 0);

  const options: OptionPresentation[] = tallies.map((t) => ({
    optionId: t.optionId,
    votes: t.votes,
    percentage: totalVotes === 0 ? 0 : Math.round((t.votes / totalVotes) * 100),
    isLeader: leaders.includes(t.optionId),
    packBarWidth: maxVotes === 0 ? 0 : Math.round((t.votes / maxVotes) * 100),
  }));

  return {
    totalVotes,
    leaders,
    isTie: leaders.length > 1,
    aheadBy: totalVotes === 0 ? 0 : maxVotes - runnerUpVotes,
    options,
    useSegmentedTally: totalVotes <= SEGMENTED_TALLY_THRESHOLD,
  };
}
