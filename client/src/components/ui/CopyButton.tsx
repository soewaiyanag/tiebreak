import { useState } from "react";
import { Button } from "./Button";
import type { ButtonVariant } from "./button-classes";

interface CopyButtonProps {
  onCopy: () => void | Promise<void>;
  label: string;
  copiedLabel?: string;
  variant?: ButtonVariant;
  className?: string;
}

const COPIED_DURATION_MS = 2000;

/** Copy link / Copy result — pulses and swaps its label to confirm the copy landed, then reverts. */
export function CopyButton({ onCopy, label, copiedLabel = "Copied!", variant = "primary", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_DURATION_MS);
  }

  return (
    <Button variant={variant} onClick={() => void handleClick()} className={className}>
      <span
        key={copied ? "copied" : "idle"}
        className="inline-block animate-[check-in_0.2s_ease-out] motion-reduce:animate-none"
      >
        {copied ? copiedLabel : label}
      </span>
    </Button>
  );
}
