import { useMemo, useState, type ReactNode } from "react";
import { guestApi, remoteApi } from "./api";
import { useSession } from "./auth-client";
import { STANDALONE } from "./api-mode";
import { SessionContext, type SessionContextValue, type SessionMode } from "../hooks/useSessionContext";

const GUEST_FLAG_KEY = "tiebreak:guest-mode";

/** Standalone builds never ask the auth server for a session: everyone is in demo mode. */
function StandaloneSessionProvider({ children }: { children: ReactNode }) {
  const value = useMemo<SessionContextValue>(
    () => ({ mode: "guest", api: guestApi, isPending: false, enterGuestMode: () => {}, exitGuestMode: () => {} }),
    [],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

function AccountSessionProvider({ children }: { children: ReactNode }) {
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

export function SessionProvider({ children }: { children: ReactNode }) {
  return STANDALONE ? (
    <StandaloneSessionProvider>{children}</StandaloneSessionProvider>
  ) : (
    <AccountSessionProvider>{children}</AccountSessionProvider>
  );
}
