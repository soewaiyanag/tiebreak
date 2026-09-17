import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSessionContext } from "../../hooks/useSessionContext";

/** Guards /app/* — redirects to /login?next= unless the visitor is signed in or in guest mode. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { mode, isPending } = useSessionContext();
  const location = useLocation();

  if (isPending) return null;

  if (mode === "anonymous") {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <>{children}</>;
}
