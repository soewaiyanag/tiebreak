import type { Identity, Option, PollDetail } from "@tiebreak/shared";

/** The public ballot: creator options plus approved suggestions, in display order — never pending ones. */
export function ballotOf(poll: Pick<PollDetail, "options">): Option[] {
  return poll.options
    .filter((o) => o.source === "creator" || o.suggestionStatus === "approved")
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * What the results/reveal components actually need from an option — satisfied
 * by both the creator's full `Option` and the public `PublicOption`, so the
 * same components render both the creator's poll view and the voter's.
 */
export interface BallotOption {
  id: string;
  label: string;
  suggestedBy: Identity | null;
}
