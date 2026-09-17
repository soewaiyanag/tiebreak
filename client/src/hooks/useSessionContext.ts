import { createContext, useContext } from "react";
import type { PollsApi } from "../lib/api";

export type SessionMode = "guest" | "authenticated" | "anonymous";

export interface SessionContextValue {
  mode: SessionMode;
  api: PollsApi;
  /** True while the initial auth-session check is in flight (guest mode never waits on this). */
  isPending: boolean;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSessionContext must be used inside SessionProvider");
  return ctx;
}

export function usePollsApi(): PollsApi {
  return useSessionContext().api;
}
