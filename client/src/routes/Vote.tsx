import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import type { AvatarTint, PollResults, PublicPoll } from "@tiebreak/shared";
import { SkipLink } from "../components/layout/SkipLink";
import { Logo } from "../components/layout/Logo";
import { Skeleton } from "../components/ui/Skeleton";
import { VoteBallotView } from "../components/poll/VoteBallotView";
import { VoteAlreadyVotedView } from "../components/poll/VoteAlreadyVotedView";
import { VoteClosedView } from "../components/poll/VoteClosedView";
import { ConfirmVoteModal } from "../components/poll/ConfirmVoteModal";
import { SuggestModal } from "../components/poll/SuggestModal";
import { NotFound } from "./NotFound";
import { usePollsApi } from "../hooks/useSessionContext";
import { useAnnouncer } from "../hooks/useAnnouncer";
import { randomTint } from "../lib/dicebear";
import { getOrCreateVoterToken } from "../lib/voter-token";
import { getVotedRecord, setVotedRecord, type VotedRecord } from "../lib/voted-record";

interface Errors {
  name?: string;
  selection?: string;
}

export function Vote() {
  const { slug } = useParams<{ slug: string }>();
  const api = usePollsApi();
  const { announceStatus } = useAnnouncer();

  const [poll, setPoll] = useState<PublicPoll | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [votedRecord, setVotedRecordState] = useState<VotedRecord | null>(() =>
    slug ? getVotedRecord(slug) : null,
  );

  const [name, setName] = useState(votedRecord?.voterName ?? "");
  const [tint, setTint] = useState<AvatarTint>(randomTint());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestSubmitting, setSuggestSubmitting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const ballotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    Promise.all([api.getPublicPoll(slug), api.getResults(slug)])
      .then(([p, r]) => {
        setPoll(p);
        setResults(r);
      })
      .catch(() => setNotFound(true));
  }, [api, slug]);

  useEffect(() => {
    if (!slug) return;
    return api.subscribeToResults(slug, setResults);
  }, [api, slug]);

  function toggleOption(optionId: string) {
    if (!poll) return;
    if (poll.type === "single") {
      setSelectedIds([optionId]);
      return;
    }
    setSelectedIds((prev) => {
      if (prev.includes(optionId)) return prev.filter((id) => id !== optionId);
      if (prev.length >= poll.maxChoices) return prev;
      return [...prev, optionId];
    });
  }

  function handleCastClick() {
    const nextErrors: Errors = {};
    if (!name.trim()) nextErrors.name = "Add a name so the crew knows who voted.";
    if (selectedIds.length === 0) nextErrors.selection = "Pick an option first.";
    setErrors(nextErrors);
    if (nextErrors.name) return nameRef.current?.focus();
    if (nextErrors.selection) return ballotRef.current?.querySelector("input")?.focus();
    setConfirmOpen(true);
  }

  async function handleConfirmVote() {
    if (!poll || !slug) return;
    setSubmitting(true);
    try {
      const voterToken = getOrCreateVoterToken(slug);
      const { results: newResults } = await api.castVote(slug, {
        voterName: name.trim(),
        voterAvatar: { seed: name.trim(), tint },
        voterToken,
        optionIds: selectedIds,
      });
      setResults(newResults);
      const record: VotedRecord = { optionIds: selectedIds, voterName: name.trim() };
      setVotedRecord(slug, record);
      setVotedRecordState(record);
      const labels = selectedIds.map((id) => poll.options.find((o) => o.id === id)?.label).join(" and ");
      announceStatus(`Vote cast for ${labels}`);
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  async function handleSuggest(label: string) {
    if (!slug) return;
    setSuggestSubmitting(true);
    try {
      await api.suggestOption(slug, { label, suggestedBy: { name: name.trim(), avatar: { seed: name.trim(), tint } } });
      announceStatus(`Suggestion sent: "${label}"`);
      setSuggestOpen(false);
    } finally {
      setSuggestSubmitting(false);
    }
  }

  if (notFound) return <NotFound />;

  if (!poll || !results) {
    return (
      <main className="mx-auto max-w-content px-4 py-10">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-48 w-full" />
      </main>
    );
  }

  const votedOptionLabels = votedRecord?.optionIds
    .map((id) => poll.options.find((o) => o.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  return (
    <>
      <SkipLink />
      <header className="px-4 py-5">
        <Logo />
      </header>
      <main id="main" className="mx-auto max-w-content px-4 pb-28">
        {results.status === "settled" ? (
          <VoteClosedView
            poll={poll}
            results={results}
            votedOptionLabels={votedOptionLabels}
            viewerOptionId={votedRecord?.optionIds[0] ?? null}
          />
        ) : votedRecord ? (
          <VoteAlreadyVotedView
            poll={poll}
            results={results}
            votedOptionLabels={votedOptionLabels ?? []}
            onSuggestClick={() => setSuggestOpen(true)}
          />
        ) : (
          <VoteBallotView
            poll={poll}
            name={name}
            onNameChange={setName}
            nameError={errors.name}
            nameRef={nameRef}
            tint={tint}
            onTintChange={setTint}
            selectedIds={selectedIds}
            onToggleOption={toggleOption}
            selectionError={errors.selection}
            ballotRef={ballotRef}
            onSuggestClick={() => setSuggestOpen(true)}
            onCastClick={handleCastClick}
          />
        )}
      </main>

      <ConfirmVoteModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void handleConfirmVote()}
        optionLabels={selectedIds.map((id) => poll.options.find((o) => o.id === id)?.label ?? "")}
        submitting={submitting}
      />
      <SuggestModal
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        onSubmit={(label) => void handleSuggest(label)}
        voterName={name}
        submitting={suggestSubmitting}
      />
    </>
  );
}
