import type { ReactNode } from "react";
import { useLocation } from "react-router";

/**
 * Remounts its children on every path change with a short rise-in (page-in
 * in globals.css), so moving between pages reads as arriving somewhere.
 * The first page load doesn't animate: react-router gives the initial
 * entry the key "default", and nobody should wait on choreography to see a
 * page they just opened.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const animate = location.key !== "default";

  return (
    <div
      key={location.pathname}
      className={
        animate ? "animate-[page-in_0.26s_var(--ease-out)] motion-reduce:animate-[page-fade_0.2s_ease-out]" : undefined
      }
    >
      {children}
    </div>
  );
}
