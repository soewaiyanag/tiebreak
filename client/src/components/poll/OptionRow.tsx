import type { Option } from "@tiebreak/shared";
import type { OptionPresentation } from "../../lib/tally";
import { Avatar } from "../ui/Avatar";
import { PackBar } from "./PackBar";

export function OptionRow({ option, tally }: { option: Option; tally: OptionPresentation }) {
  return (
    <div className="border-b-[length:var(--border-divider)] border-dashed border-cream-deep py-4 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-body text-md font-extrabold text-cocoa">{option.label}</p>
          {option.suggestedBy && (
            <span className="mt-1 flex items-center gap-1.5 font-body text-sm text-cocoa-soft">
              <Avatar avatar={option.suggestedBy.avatar} size={20} alt="" />
              Suggested by {option.suggestedBy.name}
            </span>
          )}
        </div>
        <p className="shrink-0 font-display text-lg font-extrabold tabular-nums text-cocoa">
          {tally.percentage}%{" "}
          <span className="font-body text-sm font-bold text-cocoa-soft">
            {tally.votes} vote{tally.votes === 1 ? "" : "s"}
          </span>
        </p>
      </div>
      <div className="mt-2">
        <PackBar widthPercent={tally.packBarWidth} />
      </div>
    </div>
  );
}
