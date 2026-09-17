import { useId, type ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
  hint?: string;
}

/** Cocoa text + icon under the field it describes, associated via aria-describedby (guidance/accessibility.md). */
export function FormField({ label, error, children, hint }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="block font-body text-sm font-bold text-cocoa">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mt-0.5 font-body text-sm text-cocoa-soft">
          {hint}
        </p>
      )}
      <div className="mt-1.5">{children({ id, "aria-describedby": describedBy, "aria-invalid": Boolean(error) })}</div>
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 font-body text-sm text-cocoa">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
            <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4v3.5M7 9.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
