import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface ConfirmVoteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  optionLabels: string[];
  submitting: boolean;
  /** A failed cast (guidance/brand-kit.md "Errors & destructive actions") — name/avatar/selection stay intact, retry reuses this same button. */
  error?: string;
}

/** Votes are final — "no takebacks" earns a confirmation step even though it's not strictly required at AA. */
export function ConfirmVoteModal({ open, onClose, onConfirm, optionLabels, submitting, error }: ConfirmVoteModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={`Cast my vote for ${optionLabels.join(" and ")}?`}>
      <p className="font-body text-sm text-cocoa-soft">
        Votes are final — there's no changing it after this, so make sure that's the one.
      </p>
      {error && (
        <p className="mt-3 flex items-center gap-1.5 font-body text-sm text-cocoa" role="alert">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
            <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4v3.5M7 9.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Go back
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={submitting}>
          {submitting ? "Casting…" : error ? "Try again" : "Cast my vote"}
        </Button>
      </div>
    </Modal>
  );
}
