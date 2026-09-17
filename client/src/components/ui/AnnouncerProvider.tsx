import { useCallback, useRef, useState, type ReactNode } from "react";
import { AnnouncerContext } from "../../lib/announcer-context";

/**
 * Exactly the two live regions guidance/accessibility.md allows: one polite
 * region summarizing the race (throttled, so a busy poll doesn't flood the
 * buffer with per-vote announcements) and one role="status" for one-off
 * confirmations. Mounted once, near the app root.
 */
const RESULTS_THROTTLE_MS = 4000;

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [resultsMessage, setResultsMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const lastAnnouncedAt = useRef(0);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announceResults = useCallback((message: string) => {
    const send = () => {
      lastAnnouncedAt.current = Date.now();
      setResultsMessage(message);
    };
    const elapsed = Date.now() - lastAnnouncedAt.current;
    if (elapsed >= RESULTS_THROTTLE_MS) {
      send();
    } else {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
      pendingTimer.current = setTimeout(send, RESULTS_THROTTLE_MS - elapsed);
    }
  }, []);

  const announceStatus = useCallback((message: string) => {
    // Clear first so the same message twice in a row still gets announced.
    setStatusMessage("");
    requestAnimationFrame(() => setStatusMessage(message));
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announceResults, announceStatus }}>
      {children}
      <div role="status" aria-live="polite" className="sr-only">
        {resultsMessage}
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}
