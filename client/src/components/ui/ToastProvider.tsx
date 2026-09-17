import { useCallback, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastOptions } from "../../lib/toast-context";
import { useAnnouncer } from "../../lib/announcer-context";
import { buttonClasses } from "./button-classes";

/** "Not this time" needs an undo (guidance/patterns.md) — a generous timeout, not a snap decision. */
const TOAST_TIMEOUT_MS = 8000;

/** Must be nested inside AnnouncerProvider — a shown toast is announced through it. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { announceStatus } = useAnnouncer();

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback<(options: ToastOptions) => void>(
    (options) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast(options);
      announceStatus(options.message);
      timerRef.current = setTimeout(() => setToast(null), TOAST_TIMEOUT_MS);
    },
    [announceStatus],
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-[length:var(--radius-lg)] border-[length:var(--border-card)] border-cocoa bg-cocoa px-5 py-4 text-cream-bright shadow-lg">
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
              className="rounded-full p-1 text-cream-bright/80 hover:text-cream-bright focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
