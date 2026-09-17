import type { Option, PollDetail } from "@tiebreak/shared";

/** The public ballot: creator options plus approved suggestions, in display order — never pending ones. */
export function ballotOf(poll: Pick<PollDetail, "options">): Option[] {
  return poll.options
    .filter((o) => o.source === "creator" || o.suggestionStatus === "approved")
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
