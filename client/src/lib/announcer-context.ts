import { createContext, useContext } from "react";

export interface AnnouncerContextValue {
  /** Throttled, for the live-results summary — never floods the screen-reader buffer. */
  announceResults: (message: string) => void;
  /** Immediate, role="status" — for one-off confirmations (Copy link, moderation outcomes). */
  announceStatus: (message: string) => void;
}

export const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

export function useAnnouncer(): AnnouncerContextValue {
  const ctx = useContext(AnnouncerContext);
  if (!ctx) throw new Error("useAnnouncer must be used inside AnnouncerProvider");
  return ctx;
}
