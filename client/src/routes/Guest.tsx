import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSessionContext } from "../hooks/useSessionContext";

/** Entry point for "Try as guest" — seeds the demo data, then hands off to the dashboard. */
export function Guest() {
  const { enterGuestMode } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    enterGuestMode();
    navigate("/app", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
