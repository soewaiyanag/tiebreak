import { flushSync } from "react-dom";

interface ViewTransitionOptions {
  /**
   * Animate list items instead of crossfading the page: every element with a
   * `data-morph` key gets a view-transition name before and after the update,
   * so the same key moves to its new place (a suggestion card becoming its
   * ballot row), other items slide, and items that appear or vanish grow in
   * or shrink away. Styles in globals.css.
   */
  morph?: boolean;
}

const MORPH_SELECTOR = "[data-morph]";

function nameMorphTargets(name: (el: HTMLElement) => string): void {
  document.querySelectorAll<HTMLElement>(MORPH_SELECTOR).forEach((el) => {
    el.style.viewTransitionName = name(el);
  });
}

// View-transition names must be CSS identifiers; ids can start with a digit.
const morphName = (el: HTMLElement) => `m-${(el.dataset.morph ?? "").replace(/[^a-zA-Z0-9_-]/g, "-")}`;

/**
 * Runs a React state update inside the View Transitions API, so the browser
 * snapshots before and after and animates between them (styles in
 * globals.css). flushSync makes React commit inside the callback, which is
 * the moment the browser takes its "after" snapshot. Browsers without the
 * API just apply the update.
 */
export function withViewTransition(update: () => void, { morph = false }: ViewTransitionOptions = {}): void {
  if (typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  const root = document.documentElement;
  if (morph) {
    root.dataset.vt = "morph";
    nameMorphTargets(morphName);
  }
  const transition = document.startViewTransition(() => {
    flushSync(update);
    if (morph) nameMorphTargets(morphName);
  });
  if (morph) {
    void transition.finished.finally(() => {
      delete root.dataset.vt;
      nameMorphTargets(() => "");
    });
  }
}
