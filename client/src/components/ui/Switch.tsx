import { useId } from "react";
import { cn } from "../../lib/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** One line under the label saying what "on" means in practice. */
  hint?: string;
}

/**
 * An on/off setting as a physical switch: the knob slides across the track
 * (one object moving A to B, so ease-in-out, 200ms) and the
 * track fills teal, the system color for "yes, on". role="switch" so screen
 * readers announce on/off rather than checked.
 */
export function Switch({ checked, onChange, label, hint }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-8 w-14 shrink-0 rounded-full border-2 border-cocoa transition-colors duration-200 ease-[var(--ease-in-out)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2 motion-reduce:transition-none",
          checked ? "bg-teal" : "bg-cream-deep",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0.5 top-0.5 h-6 w-6 rounded-full border-2 border-cocoa bg-card shadow-[0_2px_0_var(--color-cocoa)] transition-transform duration-200 ease-[var(--ease-in-out)] motion-reduce:transition-none",
            checked && "translate-x-6",
          )}
        />
      </button>
      <div>
        {/* A real <label> for the button: clicking the words flips the switch too. */}
        <label htmlFor={id} className="block font-body text-sm font-bold text-cocoa">
          {label}
        </label>
        {hint && (
          <span id={`${id}-hint`} className="block font-body text-sm text-cocoa-soft">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}
