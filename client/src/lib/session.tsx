import { useMemo, useState, type ReactNode } from "react";
import { guestApi, remoteApi } from "./api";
import { useSession } from "./auth-client";
import { SessionContext, type SessionContextValue, type SessionMode } from "../hooks/useSessionContext";

const GUEST_FLAG_KEY = "tiebreak:guest-mode";

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: authSession, isPending } = useSession();
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_FLAG_KEY) === "1");

  const mode: SessionMode = isGuest ? "guest" : authSession ? "authenticated" : "anonymous";
  const api = isGuest ? guestApi : remoteApi;

  const value = useMemo<SessionContextValue>(
    () => ({
      mode,
      api,
      isPending: isPending && !isGuest,
      enterGuestMode: () => {
        localStorage.setItem(GUEST_FLAG_KEY, "1");
        setIsGuest(true);
      },
      exitGuestMode: () => {
        localStorage.removeItem(GUEST_FLAG_KEY);
        setIsGuest(false);
      },
    }),
    [mode, api, isPending, isGuest],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
