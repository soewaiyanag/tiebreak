import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface ConfirmVoteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  optionLabels: string[];
  submitting: boolean;
}

/** Votes are final — "no takebacks" earns a confirmation step even though it's not strictly required at AA. */
export function ConfirmVoteModal({ open, onClose, onConfirm, optionLabels, submitting }: ConfirmVoteModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={`Cast my vote for ${optionLabels.join(" and ")}?`}>
      <p className="font-body text-sm text-cocoa-soft">
        Votes are final — there's no changing it after this, so make sure that's the one.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Go back
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={submitting}>
          {submitting ? "Casting…" : "Cast my vote"}
        </Button>
      </div>
    </Modal>
  );
}
