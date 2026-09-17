import { useState } from "react";
import type { PollDetail } from "@tiebreak/shared";
import { Pill } from "../ui/Pill";
import { Button } from "../ui/Button";
import { Reveal } from "./Reveal";
import { ReopenModal } from "./ReopenModal";
import { ballotOf } from "../../lib/poll-options";
import { copyResultText } from "../../lib/reveal-text";
import { presentTally } from "../../lib/tally";

interface SettledPollBodyProps {
  poll: PollDetail;
  onCopyResult: (text: string) => void;
  onReopen: (closesAt: string) => void;
}

/** The reveal, plus the creator-only controls that sit below it: Copy result and Reopen voting. */
export function SettledPollBody({ poll, onCopyResult, onReopen }: SettledPollBodyProps) {
  const [reopenOpen, setReopenOpen] = useState(false);
  const options = ballotOf(poll);
  const presentation = presentTally(poll.results.tallies);
  const winners = options.filter((o) => presentation.leaders.includes(o.id));

  function handleCopyResult() {
    onCopyResult(
      copyResultText({
        title: poll.title,
        isTie: presentation.isTie,
        winners: winners.map((w) => ({
          label: w.label,
          votes: presentation.options.find((t) => t.optionId === w.id)?.votes ?? 0,
        })),
        totalVotes: presentation.totalVotes,
      }),
    );
  }

  return (
    <>
      <Pill tone="neutral">Settled</Pill>
      <h1 className="mt-3 text-balance font-display text-2xl font-black text-cocoa">{poll.title}</h1>

      <div className="mt-6">
        <Reveal pollId={poll.id} options={options} results={poll.results} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="primary" onClick={handleCopyResult}>
          Copy result
        </Button>
        <Button variant="secondary" onClick={() => setReopenOpen(true)}>
          Reopen voting
        </Button>
      </div>

      <ReopenModal
        open={reopenOpen}
        onClose={() => setReopenOpen(false)}
        onConfirm={(closesAt) => {
          setReopenOpen(false);
          onReopen(closesAt);
        }}
      />
    </>
  );
}
