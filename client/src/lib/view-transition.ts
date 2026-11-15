import { flushSync } from "react-dom";

/**
 * Runs a React state update inside the View Transitions API, so the browser
 * snapshots before and after and animates between them (styles in
 * globals.css). flushSync makes React commit inside the callback, which is
 * the moment the browser takes its "after" snapshot. Browsers without the
 * API just apply the update.
 */
export function withViewTransition(update: () => void): void {
  if (typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}
