import { createContext, useContext } from "react";

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export type ShowToast = (options: ToastOptions) => void;

export const ToastContext = createContext<ShowToast | null>(null);

export function useToast(): ShowToast {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
