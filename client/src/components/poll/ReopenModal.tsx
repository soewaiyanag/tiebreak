import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { INPUT_CLASSES } from "../ui/input-classes";

interface ReopenModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (closesAt: string) => void;
}

/** Reopening undoes the poll's biggest decision, so it earns a confirmation step — and a new closing time. */
export function ReopenModal({ open, onClose, onConfirm }: ReopenModalProps) {
  const [closesAt, setClosesAt] = useState("");
  const [error, setError] = useState<string>();

  function handleConfirm() {
    if (!closesAt || new Date(closesAt).getTime() <= Date.now()) {
      setError("Pick a closing time in the future.");
      return;
    }
    onConfirm(new Date(closesAt).toISOString());
    setClosesAt("");
    setError(undefined);
  }

  return (
    <Modal open={open} onClose={onClose} title="Reopen voting?">
      <p className="font-body text-sm text-cocoa-soft">
        The crew can vote again. Pick a new closing time — the old one has already passed.
      </p>
      <div className="mt-4">
        <FormField label="New closing time" error={error}>
          {(props) => (
            <input
              {...props}
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className={INPUT_CLASSES}
            />
          )}
        </FormField>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="affirmative" onClick={handleConfirm}>
          Reopen voting
        </Button>
      </div>
    </Modal>
  );
}
