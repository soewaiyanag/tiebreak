import { forwardRef } from "react";
import type { AvatarTint } from "@tiebreak/shared";
import { Avatar } from "../ui/Avatar";
import { AVATAR_TINT_BG_CLASS, AVATAR_TINTS } from "../../lib/dicebear";
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
          <div className="mt-1.5 flex gap-2">
            {AVATAR_TINTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTintChange(t)}
                aria-pressed={tint === t}
                aria-label={`Tint ${t}`}
                className={cn(
                  "h-9 w-9 rounded-full border-[length:var(--border-chip)] border-cocoa focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2",
                  AVATAR_TINT_BG_CLASS[t],
                  tint === t && "ring-[3px] ring-cocoa ring-offset-2",
                )}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
});
