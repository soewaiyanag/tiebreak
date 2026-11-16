import type { RefObject } from "react";
import { createPortal } from "react-dom";
import type { AvatarTint, PublicPoll } from "@tiebreak/shared";
import { StatusSticker } from "./StatusSticker";
import { Button } from "../ui/Button";
import { AvatarPicker } from "./AvatarPicker";
import { BallotFieldset } from "./BallotFieldset";
import { linkButtonClasses } from "../ui/link-button-classes";

interface VoteBallotViewProps {
  poll: PublicPoll;
  name: string;
  onNameChange: (name: string) => void;
  nameError?: string;
  nameRef: RefObject<HTMLInputElement | null>;
  tint: AvatarTint;
  onTintChange: (tint: AvatarTint) => void;
  selectedIds: string[];
  onToggleOption: (optionId: string) => void;
  selectionError?: string;
  ballotRef: RefObject<HTMLDivElement | null>;
  onSuggestClick: () => void;
  onCastClick: () => void;
}

/** The ballot itself — the most-visited screen in the product, seen by people who never chose to use Tiebreak. */
export function VoteBallotView({
  poll,
  name,
  onNameChange,
  nameError,
  nameRef,
  tint,
  onTintChange,
  selectedIds,
  onToggleOption,
  selectionError,
  ballotRef,
  onSuggestClick,
  onCastClick,
}: VoteBallotViewProps) {
  const canCast = selectedIds.length > 0 && Boolean(name.trim());
  const selectedLabels = selectedIds.map((id) => poll.options.find((o) => o.id === id)?.label).join(" and ");

  return (
    <>
      {/* Named for the vote view transition: the sticker and title stay put while the page below swaps. */}
      <span className="inline-block [view-transition-name:poll-status]">
        <StatusSticker state="open" closesAt={poll.closesAt} />
      </span>
      <h1 className="mt-3 text-balance font-display text-2xl font-black text-cocoa [view-transition-name:poll-title]">
        {poll.title}
      </h1>

      <div className="mt-6">
        <AvatarPicker
          ref={nameRef}
          name={name}
          onNameChange={onNameChange}
          tint={tint}
          onTintChange={onTintChange}
          nameError={nameError}
        />
      </div>

      <div ref={ballotRef} className="mt-6">
        <BallotFieldset
          options={poll.options}
          type={poll.type}
          maxChoices={poll.maxChoices}
          selectedIds={selectedIds}
          onToggle={onToggleOption}
        />
        {selectionError && (
          <p className="mt-2 font-body text-sm text-cocoa" role="alert">
            {selectionError}
          </p>
        )}
      </div>

      {poll.suggestionsEnabled && (
        <button type="button" onClick={onSuggestClick} className={linkButtonClasses("mt-4")}>
          Suggest something else
        </button>
      )}

      {/* Portaled to <body>: a transformed ancestor (the route transition) would otherwise pin "fixed" to it. */}
      {createPortal(
        <div className="fixed inset-x-0 bottom-0 border-t-[length:var(--border-divider)] border-dashed border-cream-deep bg-cream-deep/95 p-4 backdrop-blur">
          <div className="mx-auto max-w-content">
            <Button variant="primary" className="w-full" onClick={onCastClick} disabled={!canCast}>
              {canCast ? `Cast my vote for ${selectedLabels}` : "Cast my vote"}
            </Button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
