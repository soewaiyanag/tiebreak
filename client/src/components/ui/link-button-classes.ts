import { cn } from "../../lib/cn";

/** A text-styled action ("Suggest something else", "+ Add an option") — secondary, but still a real focus target. */
export function linkButtonClasses(className?: string): string {
  return cn(
    "font-body text-sm font-bold text-teal-deep hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal focus-visible:ring-offset-2 disabled:opacity-40 disabled:no-underline",
    className,
  );
}
