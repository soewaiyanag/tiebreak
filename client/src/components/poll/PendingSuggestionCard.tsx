import type { Option } from "@tiebreak/shared";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";

interface PendingSuggestionCardProps {
  suggestion: Option;
  onApprove: () => void;
  onDecline: () => void;
  disabled?: boolean;
}

export function PendingSuggestionCard({ suggestion, onApprove, onDecline, disabled }: PendingSuggestionCardProps) {
  return (
    <Card
      id={`pending-suggestion-${suggestion.id}`}
      tabIndex={-1}
      className="flex flex-col gap-4 border-dashed animate-[reveal-in_0.25s_ease-out] motion-reduce:animate-none sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <Avatar avatar={suggestion.suggestedBy!.avatar} size={50} alt={suggestion.suggestedBy!.name} />
        <div>
          <p className="font-body text-md font-extrabold text-cocoa">
            {suggestion.suggestedBy!.name} suggested: "{suggestion.label}"
          </p>
          <p className="mt-1 font-body text-sm text-cocoa-soft">
            Approve it and it joins with 0 votes. Your call, house rules.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Button variant="affirmative" onClick={onApprove} disabled={disabled}>
          Add it
        </Button>
        <Button variant="secondary" onClick={onDecline} disabled={disabled}>
          Not this time
        </Button>
      </div>
    </Card>
  );
}
