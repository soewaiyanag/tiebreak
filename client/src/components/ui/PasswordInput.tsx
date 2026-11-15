import { useState, type InputHTMLAttributes } from "react";
import { INPUT_CLASSES } from "./input-classes";

/**
 * A password field with a show/hide toggle inside its right edge, so people
 * can check what they typed instead of guessing. The toggle is a real
 * button with a pressed state; the icon swaps with a quick crossfade.
 */
export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className">) {
  const [shown, setShown] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={shown ? "text" : "password"} className={`${INPUT_CLASSES} pr-14`} />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-pressed={shown}
        aria-label="Show password"
        className="absolute inset-y-0 right-1 my-auto flex h-11 w-11 items-center justify-center rounded-full text-cocoa-soft transition-colors duration-150 hover:bg-cream-deep hover:text-cocoa focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal"
      >
        <svg
          key={shown ? "hide" : "show"}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="animate-[check-in_0.18s_var(--ease-out)] motion-reduce:animate-none"
        >
          <path
            d="M1.75 10S4.75 4.25 10 4.25 18.25 10 18.25 10 15.25 15.75 10 15.75 1.75 10 1.75 10z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
          {shown && <path d="M3 17L17 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
        </svg>
      </button>
    </div>
  );
}
