import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import type { Option, PollDetail } from "@tiebreak/shared";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Pill } from "../components/ui/Pill";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { LeaderCard } from "../components/poll/LeaderCard";
import { OptionRow } from "../components/poll/OptionRow";
import { VoterCrewStack } from "../components/poll/VoterCrewStack";
import { PendingSuggestionCard } from "../components/poll/PendingSuggestionCard";
import { usePollsApi } from "../lib/session-context";
import { useAnnouncer } from "../lib/announcer-context";
import { useToast } from "../lib/toast-context";
import { presentTally } from "../lib/tally";
import { formatClosingTime } from "../lib/format";

function ballotOf(poll: PollDetail): Option[] {
  return poll.options
    .filter((o) => o.source === "creator" || o.suggestionStatus === "approved")
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function PollView() {
  const { id } = useParams<{ id: string }>();
  const api = usePollsApi();
  const { announceResults, announceStatus } = useAnnouncer();
  const showToast = useToast();

  const [poll, setPoll] = useState<PollDetail | null>(null);
  const pollRef = useRef<PollDetail | null>(null);
  const lastAnnouncedTotal = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  const refetch = useCallback(() => {
    if (!id) return;
    void api.getPoll(id).then(setPoll);
  }, [api, id]);

  useEffect(refetch, [refetch]);

  const slug = poll?.slug;
  useEffect(() => {
    if (!slug) return;
    return api.subscribeToResults(slug, (results) => {
      setPoll((prev) => (prev ? { ...prev, results, status: results.status } : prev));

      if (results.totalVotes > 0 && results.totalVotes !== lastAnnouncedTotal.current) {
        lastAnnouncedTotal.current = results.totalVotes;
        const presentation = presentTally(results.tallies);
        const leaderId = presentation.leaders[0];
        const leaderOption = pollRef.current?.options.find((o) => o.id === leaderId);
        const leaderTally = presentation.options.find((t) => t.optionId === leaderId);
        if (leaderOption && leaderTally) {
          announceResults(
            presentation.isTie
              ? `Tied at ${leaderTally.votes} votes each`
              : `${leaderOption.label}: ${leaderTally.votes} of ${results.totalVotes} votes, in the lead`,
          );
        }
      }
    });
  }, [api, slug, announceResults]);

  async function resolveSuggestion(suggestion: Option, action: "approve" | "decline") {
    if (!poll) return;
    const pending = poll.options.filter((o) => o.suggestionStatus === "pending");
    const idx = pending.findIndex((o) => o.id === suggestion.id);
    const nextFocusId = pending[idx + 1]?.id ?? pending[idx - 1]?.id ?? null;

    if (action === "approve") {
      await api.approveSuggestion(poll.id, suggestion.id);
      announceStatus(`${suggestion.label} added to the ballot with 0 votes`);
    } else {
      await api.declineSuggestion(poll.id, suggestion.id);
      announceStatus(`Declined "${suggestion.label}"`);
      showToast({
        message: `Declined "${suggestion.label}"`,
        actionLabel: "Undo",
        onAction: () => {
          void api.restoreSuggestion(poll.id, suggestion.id).then(refetch);
        },
      });
    }

    refetch();
    requestAnimationFrame(() => {
      const target = nextFocusId ? document.getElementById(`pending-suggestion-${nextFocusId}`) : headingRef.current;
      target?.focus();
    });
  }

  async function copyLink() {
    if (!poll) return;
    await navigator.clipboard.writeText(`${window.location.origin}/p/${poll.slug}`);
    announceStatus("Link copied");
  }

  async function endVoting() {
    if (!poll) return;
    await api.settlePoll(poll.id);
    announceStatus("Voting ended");
    refetch();
  }

  if (!poll) {
    return (
      <AppShell>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </AppShell>
    );
  }

  if (poll.status === "settled") {
    // Built out fully in the next step — the reveal.
    return (
      <AppShell>
        <Pill tone="neutral">Settled</Pill>
        <h1 className="mt-3 font-display text-2xl font-black text-cocoa">{poll.title}</h1>
        <p className="mt-4 font-body text-base text-cocoa-soft">Voting has ended.</p>
      </AppShell>
    );
  }

  const options = ballotOf(poll);
  const presentation = presentTally(poll.results.tallies);
  const leaderOptions = options.filter((o) => presentation.leaders.includes(o.id));
  const trailingOptions = options.filter((o) => !presentation.leaders.includes(o.id));
  const pendingSuggestions = poll.options.filter((o) => o.suggestionStatus === "pending");
  const shareUrl = `${window.location.origin}/p/${poll.slug}`;

  return (
    <AppShell>
      <Pill tone="teal">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-deep" aria-hidden="true" />
        Voting open
      </Pill>
      <span className="ml-2 inline-block">
        <Pill tone="neutral">Closes {formatClosingTime(poll.closesAt)}</Pill>
      </span>

      <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-balance font-display text-2xl font-black text-cocoa">
        {poll.title}
      </h1>

      <div className="mt-3">
        <VoterCrewStack crew={poll.results.voterCrew ?? []} lastVoteAt={poll.results.lastVoteAt} />
      </div>

      <div className="mt-6 space-y-4">
        {presentation.totalVotes === 0 ? (
          <p className="font-body text-sm text-cocoa-soft">
            No votes yet — share the link below and come back once your crew has weighed in.
          </p>
        ) : presentation.isTie ? (
          <>
            <p className="font-body text-sm font-bold text-cocoa">
              Tied at {presentation.options.find((t) => t.optionId === leaderOptions[0]?.id)?.votes} votes each —
              still anyone's game
            </p>
            <div className="space-y-3">
              {leaderOptions.map((option) => (
                <LeaderCard
                  key={option.id}
                  option={option}
                  tally={presentation.options.find((t) => t.optionId === option.id)!}
                  totalVotes={presentation.totalVotes}
                  aheadBy={0}
                  isTie
                  useSegmentedTally={presentation.useSegmentedTally}
                />
              ))}
            </div>
          </>
        ) : (
          leaderOptions[0] && (
            <LeaderCard
              option={leaderOptions[0]}
              tally={presentation.options.find((t) => t.optionId === leaderOptions[0].id)!}
              totalVotes={presentation.totalVotes}
              aheadBy={presentation.aheadBy}
              isTie={false}
              useSegmentedTally={presentation.useSegmentedTally}
            />
          )
        )}

        {trailingOptions.length > 0 && (
          <Card className="py-2">
            {trailingOptions.map((option) => (
              <OptionRow
                key={option.id}
                option={option}
                tally={presentation.options.find((t) => t.optionId === option.id)!}
              />
            ))}
          </Card>
        )}
      </div>

      {pendingSuggestions.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="font-display text-md font-extrabold text-cocoa">Pending suggestions</h2>
          {pendingSuggestions.map((suggestion) => (
            <PendingSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onApprove={() => void resolveSuggestion(suggestion, "approve")}
              onDecline={() => void resolveSuggestion(suggestion, "decline")}
            />
          ))}
        </div>
      )}

      <Card className="mt-6 flex flex-col gap-4 bg-cream-deep sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 truncate font-body text-sm text-cocoa">
          Anyone with the link can vote: <span className="font-bold">{shareUrl}</span>
        </p>
        <div className="flex shrink-0 gap-3">
          <Button variant="secondary" onClick={endVoting}>
            End voting
          </Button>
          <Button variant="primary" onClick={copyLink}>
            Copy link
          </Button>
        </div>
      </Card>
      <p className="mt-3 font-body text-sm text-cocoa-soft">
        Ending early isn't final — you can reopen voting later if the crew changes its mind.
      </p>
    </AppShell>
  );
}
