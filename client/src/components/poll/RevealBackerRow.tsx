import type { Option, PollResults } from "@tiebreak/shared";
import type { OptionPresentation } from "../../lib/tally";
import { backersLine } from "../../lib/reveal-text";

/** A non-winning option in the settled reveal: who backed it, not a bar — the race is over. */
export function RevealBackerRow({
  option,
  tally,
  results,
  viewerOptionId,
}: {
  option: Option;
  tally: OptionPresentation;
  results: PollResults;
  viewerOptionId?: string | null;
}) {
  const voters = results.attribution?.find((a) => a.optionId === option.id)?.voters ?? [];

  return (
    <div className="flex items-center justify-between gap-4 border-b-[length:var(--border-divider)] border-dashed border-cream-deep py-4 last:border-b-0">
      <div>
        <p className="font-body text-md font-extrabold text-cocoa">
          {option.label}
          {option.id === viewerOptionId && (
            <span className="ml-2 font-body text-sm font-bold text-teal-deep">You backed this</span>
          )}
        </p>
        <p className="font-body text-sm text-cocoa-soft">{backersLine(voters)}</p>
      </div>
      <p className="shrink-0 font-display text-sm font-extrabold tabular-nums text-cocoa-soft">
        {tally.votes} vote{tally.votes === 1 ? "" : "s"}
      </p>
    </div>
  );
}
