import { forwardRef } from "react";
import type { AvatarTint } from "@tiebreak/shared";
import { Avatar } from "../ui/Avatar";
import { AVATAR_TINT_BG_CLASS, AVATAR_TINT_NAME, AVATAR_TINTS } from "../../lib/dicebear";
import { INPUT_CLASSES } from "../ui/input-classes";
import { FormField } from "../ui/FormField";
import { cn } from "../../lib/cn";

interface AvatarPickerProps {
  name: string;
  onNameChange: (name: string) => void;
  tint: AvatarTint;
  onTintChange: (tint: AvatarTint) => void;
  nameError?: string;
}

/**
 * Identity before ballot, and make it fun (guidance/patterns.md): the avatar
 * is seeded from the typed name, so the preview is always truthful to what
 * gets submitted — one avatar mechanism, not two competing ones.
 */
export const AvatarPicker = forwardRef<HTMLInputElement, AvatarPickerProps>(function AvatarPicker(
  { name, onNameChange, tint, onTintChange, nameError },
  nameRef,
) {
  return (
    <div className="flex items-start gap-4">
      <Avatar avatar={{ seed: name || "you", tint }} size={50} alt="" />
      <div className="flex-1 space-y-3">
        <FormField label="Your name" error={nameError}>
          {(props) => (
            <input
              {...props}
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="So your crew knows who voted"
              className={INPUT_CLASSES}
            />
          )}
        </FormField>

        <fieldset>
          <legend className="font-body text-sm font-bold text-cocoa">Pick a color</legend>
          <div className="mt-2 flex gap-2.5">
            {AVATAR_TINTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTintChange(t)}
                aria-pressed={tint === t}
                aria-label={AVATAR_TINT_NAME[t]}
                data-down={tint === t}
                className={cn(
                  "piece piece-chip flex h-11 w-11 items-center justify-center rounded-full border-2 border-cocoa text-cocoa focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2 [@media(hover:hover)]:hover:animate-[wiggle_0.4s_ease-in-out] motion-reduce:hover:animate-none",
                  AVATAR_TINT_BG_CLASS[t],
                )}
              >
                {tint === t && (
                  <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" className="animate-[check-in_0.25s_var(--ease-spring)] motion-reduce:animate-none">
                    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
});
