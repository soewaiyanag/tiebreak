import type { PollType, PublicOption } from "@tiebreak/shared";
import { Avatar } from "../ui/Avatar";
import { cn } from "../../lib/cn";

interface BallotFieldsetProps {
  options: PublicOption[];
  type: PollType;
  maxChoices: number;
  selectedIds: string[];
  onToggle: (optionId: string) => void;
}

/** A real fieldset of radio/checkbox inputs, never clickable divs (guidance/accessibility.md). */
export function BallotFieldset({ options, type, maxChoices, selectedIds, onToggle }: BallotFieldsetProps) {
  const atLimit = type === "multi" && selectedIds.length >= maxChoices;

  return (
    <fieldset>
      <legend className="font-body text-sm font-bold text-cocoa">
        {type === "single" ? "Pick one" : `Pick up to ${maxChoices}`}
      </legend>
      <div className="mt-2 space-y-2.5">
        {options.map((option) => {
          const selected = selectedIds.includes(option.id);
          const disabled = !selected && atLimit;
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-[length:var(--radius-md)] border-[length:var(--border-chip)] border-cocoa bg-card px-4 py-3.5 transition-colors",
                selected && "border-[length:var(--border-card)] border-tangerine-deep bg-cream-deep",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                type={type === "single" ? "radio" : "checkbox"}
                name="ballot"
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(option.id)}
                className="h-5 w-5 shrink-0 accent-tangerine-deep"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-body text-md font-extrabold text-cocoa">{option.label}</span>
                {option.suggestedBy && (
                  <span className="mt-0.5 flex items-center gap-1.5 font-body text-sm text-cocoa-soft">
                    <Avatar avatar={option.suggestedBy.avatar} size={20} alt="" />
                    Suggested by {option.suggestedBy.name}
                  </span>
                )}
              </span>
              {selected && (
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0 text-tangerine-deep">
                  <path
                    d="M4 10.5l4 4 8-9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
