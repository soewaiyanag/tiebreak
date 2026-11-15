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
      <div className="mt-2 space-y-3">
        {options.map((option) => {
          const selected = selectedIds.includes(option.id);
          const disabled = !selected && atLimit;
          return (
            <label
              key={option.id}
              data-down={selected}
              data-disabled={disabled}
              className={cn(
                "piece piece-chip flex cursor-pointer items-center gap-3 rounded-[length:var(--radius-md)] border-2 border-cocoa bg-card px-4 py-3.5 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-teal has-[:focus-visible]:ring-offset-2",
                !selected && !disabled && "hover:bg-cream-deep/50",
                selected && "border-tangerine-deep bg-cream-deep",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                type={type === "single" ? "radio" : "checkbox"}
                name="ballot"
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(option.id)}
                className="sr-only"
              />
              {/* The drawn stand-in for the visually hidden input above: a ring that fills and pops a check. */}
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center border-2 border-cocoa transition-colors duration-150",
                  type === "single" ? "rounded-full" : "rounded-[0.375rem]",
                  selected ? "border-tangerine-deep bg-tangerine-deep text-cream-bright" : "bg-cream",
                )}
              >
                {selected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    className="animate-[pop_0.18s_var(--ease-out)] motion-reduce:animate-none"
                  >
                    <path
                      d="M4 10.5l4 4 8-9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-body text-md font-extrabold text-cocoa">{option.label}</span>
                {option.suggestedBy && (
                  <span className="mt-0.5 flex items-center gap-1.5 font-body text-sm text-cocoa-soft">
                    <Avatar avatar={option.suggestedBy.avatar} size={20} alt="" />
                    Suggested by {option.suggestedBy.name}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
