import { cn } from "../../lib/cn";

/**
 * A text-styled action ("Suggest something else", "+ Add an option") — secondary, but still a real focus target.
 * The underline is a background stripe that draws in from the left on hover instead of snapping on.
 */
export function linkButtonClasses(className?: string): string {
  return cn(
    "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat pb-0.5 font-body text-sm font-bold text-teal-deep transition-[background-size] duration-300 ease-[var(--ease-out)] hover:bg-[length:100%_2px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2 disabled:opacity-40 disabled:hover:bg-[length:0%_2px] motion-reduce:transition-none",
    className,
  );
}
