import { useEffect, useState } from "react";

const PREFIX = "tiebreak:reveal-seen:";

/**
 * The reveal's entrance animation plays once per poll per browser (design
 * challenge 2's "reveal moment" decision), then the screen stays static on
 * repeat visits — the celebration marks the moment, not every page load.
 */
export function useShouldPlayReveal(pollId: string): boolean {
  const key = PREFIX + pollId;
  const [alreadySeen] = useState(() => localStorage.getItem(key) === "1");

  useEffect(() => {
    localStorage.setItem(key, "1");
  }, [key]);

  return !alreadySeen;
}
