import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { INPUT_CLASSES } from "../ui/input-classes";

interface SuggestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (label: string) => void;
  voterName: string;
  submitting: boolean;
}

/** "Suggest something else" — a real modal dialog, per guidance/accessibility.md. */
export function SuggestModal({ open, onClose, onSubmit, voterName, submitting }: SuggestModalProps) {
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string>();

  function handleSubmit() {
    if (!voterName.trim()) {
      setError("Add your name above first, so we know who's suggesting this.");
      return;
    }
    if (!label.trim()) {
      setError("What's the idea?");
      return;
    }
    onSubmit(label.trim());
    setLabel("");
    setError(undefined);
  }

  return (
    <Modal open={open} onClose={onClose} title="Suggest something else">
      <FormField label="What should we add?" error={error}>
        {(props) => (
          <input
            {...props}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Just order salads"
            className={INPUT_CLASSES}
          />
        )}
      </FormField>
      <p className="mt-3 font-body text-sm text-cocoa-soft">
        It'll show up as "Suggested by {voterName || "you"}" once the organizer approves it.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="affirmative" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Sending…" : "Suggest it"}
        </Button>
      </div>
    </Modal>
  );
}
