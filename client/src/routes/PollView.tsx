import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import type { Option, PollDetail } from "@tiebreak/shared";
import { AppShell } from "../components/layout/AppShell";
import { Skeleton } from "../components/ui/Skeleton";
import { LivePollBody } from "../components/poll/LivePollBody";
import { SettledPollBody } from "../components/poll/SettledPollBody";
import { usePollsApi } from "../hooks/useSessionContext";
import { useAnnouncer } from "../hooks/useAnnouncer";
import { useToast } from "../hooks/useToast";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { presentTally } from "../lib/tally";
import { NotFound } from "./NotFound";

export function PollView() {
  const { id } = useParams<{ id: string }>();
  const api = usePollsApi();
  const { announceResults, announceStatus } = useAnnouncer();
  const showToast = useToast();

  const [poll, setPoll] = useState<PollDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  useDocumentTitle(
    poll ? `${poll.title}: ${poll.status === "settled" ? "settled" : "live results"} · Tiebreak` : "Loading poll · Tiebreak",
  );
  const pollRef = useRef<PollDetail | null>(null);
  const lastAnnouncedTotal = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  const refetch = useCallback(() => {
    if (!id) return;
    void api.getPoll(id).then(setPoll).catch(() => setNotFound(true));
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

  async function copyResult(text: string) {
    await navigator.clipboard.writeText(text);
    announceStatus("Result copied");
  }

  async function endVoting() {
    if (!poll) return;
    await api.settlePoll(poll.id);
    announceStatus("Voting ended");
    refetch();
  }

  async function reopen(closesAt: string) {
    if (!poll) return;
    await api.reopenPoll(poll.id, { closesAt });
    announceStatus("Voting reopened");
    refetch();
  }

  if (notFound) return <NotFound />;

  if (!poll) {
    return (
      <AppShell>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      {poll.status === "settled" ? (
        <SettledPollBody poll={poll} onCopyResult={(text) => void copyResult(text)} onReopen={(c) => void reopen(c)} />
      ) : (
        <LivePollBody
          poll={poll}
          headingRef={headingRef}
          onApproveSuggestion={(s) => void resolveSuggestion(s, "approve")}
          onDeclineSuggestion={(s) => void resolveSuggestion(s, "decline")}
          onEndVoting={() => void endVoting()}
          onCopyLink={() => void copyLink()}
        />
      )}
    </AppShell>
  );
}
