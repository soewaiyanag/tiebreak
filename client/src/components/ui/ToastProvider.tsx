import { useCallback, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastOptions } from "../../hooks/useToast";
import { useAnnouncer } from "../../hooks/useAnnouncer";
import { CloseIcon } from "./CloseIcon";
import { buttonClasses } from "./button-classes";

/** "Not this time" needs an undo (guidance/patterns.md) — a generous timeout, not a snap decision. */
const TOAST_TIMEOUT_MS = 8000;

/** Must be nested inside AnnouncerProvider — a shown toast is announced through it. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  // Dismissing plays the exit first; the toast is removed when it finishes.
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { announceStatus } = useAnnouncer();

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLeaving(true);
  }, []);

  const showToast = useCallback<(options: ToastOptions) => void>(
    (options) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast(options);
      setLeaving(false);
      announceStatus(options.message);
      timerRef.current = setTimeout(() => setLeaving(true), TOAST_TIMEOUT_MS);
    },
    [announceStatus],
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          onAnimationEnd={(e) => {
            if (!leaving || e.target !== e.currentTarget) return;
            setToast(null);
            setLeaving(false);
          }}
          className={`fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-[length:var(--radius-lg)] border-[length:var(--border-card)] border-cocoa bg-cocoa px-5 py-4 text-cream-bright ${
            leaving
              ? "pointer-events-none animate-[toast-out_0.16s_var(--ease-in)_both] motion-reduce:animate-[fade-out_0.12s_linear_both]"
              : "animate-[toast-in_0.2s_ease-out] motion-reduce:animate-none"
          }`}
        >
          <p className="font-body text-sm">{toast.message}</p>
          <div className="flex shrink-0 items-center gap-3">
            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  dismiss();
                }}
                className={buttonClasses("primary", "px-4 py-1.5")}
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="flex h-11 w-11 items-center justify-center rounded-full text-cream-bright/80 transition-[color,rotate] duration-200 ease-[var(--ease-out)] hover:rotate-90 hover:text-cream-bright focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal motion-reduce:transition-none motion-reduce:hover:rotate-0"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
