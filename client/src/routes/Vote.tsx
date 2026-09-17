import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import type { AvatarTint, PollResults, PublicPoll } from "@tiebreak/shared";
import { SkipLink } from "../components/layout/SkipLink";
import { Logo } from "../components/layout/Logo";
import { Skeleton } from "../components/ui/Skeleton";
import { Pill } from "../components/ui/Pill";
import { Button } from "../components/ui/Button";
import { AvatarPicker } from "../components/poll/AvatarPicker";
import { BallotFieldset } from "../components/poll/BallotFieldset";
import { ConfirmVoteModal } from "../components/poll/ConfirmVoteModal";
import { SuggestModal } from "../components/poll/SuggestModal";
import { VoterResults } from "../components/poll/VoterResults";
import { Reveal } from "../components/poll/Reveal";
import { NotFound } from "./NotFound";
import { usePollsApi } from "../hooks/useSessionContext";
import { useAnnouncer } from "../hooks/useAnnouncer";
import { randomTint } from "../lib/dicebear";
import { getOrCreateVoterToken } from "../lib/voter-token";
import { getVotedRecord, setVotedRecord, type VotedRecord } from "../lib/voted-record";
import { formatClosingTime } from "../lib/format";

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
      announceStatus(`Vote cast for ${selectedIds.map((id) => poll.options.find((o) => o.id === id)?.label).join(" and ")}`);
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

  const effectiveStatus = results.status;
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
        {effectiveStatus === "settled" ? (
          <>
            <Pill tone="neutral">Settled</Pill>
            <h1 className="mt-3 text-balance font-display text-2xl font-black text-cocoa">{poll.title}</h1>
            {votedOptionLabels && votedOptionLabels.length > 0 && (
              <p className="mt-2 font-body text-sm font-bold text-teal-deep">
                You backed {votedOptionLabels.join(" and ")}
              </p>
            )}
            <div className="mt-6">
              <Reveal pollId={poll.id} options={poll.options} results={results} viewerOptionId={votedRecord?.optionIds[0] ?? null} />
            </div>
          </>
        ) : votedRecord ? (
          <>
            <Pill tone="teal">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-deep" aria-hidden="true" />
              Voting open
            </Pill>
            <h1 className="mt-3 text-balance font-display text-2xl font-black text-cocoa">{poll.title}</h1>
            <p className="mt-2 font-body text-sm font-bold text-teal-deep">
              You backed {votedOptionLabels?.join(" and ")} — thanks for voting, no takebacks
            </p>
            <div className="mt-6">
              <VoterResults options={poll.options} results={results} />
            </div>
            {poll.suggestionsEnabled && (
              <button
                type="button"
                onClick={() => setSuggestOpen(true)}
                className="mt-6 font-body text-sm font-bold text-teal-deep hover:underline"
              >
                Suggest something else
              </button>
            )}
          </>
        ) : (
          <>
            <Pill tone="teal">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-deep" aria-hidden="true" />
              Closes {formatClosingTime(poll.closesAt)}
            </Pill>
            <h1 className="mt-3 text-balance font-display text-2xl font-black text-cocoa">{poll.title}</h1>

            <div className="mt-6">
              <AvatarPicker
                ref={nameRef}
                name={name}
                onNameChange={setName}
                tint={tint}
                onTintChange={setTint}
                nameError={errors.name}
              />
            </div>

            <div ref={ballotRef} className="mt-6">
              <BallotFieldset
                options={poll.options}
                type={poll.type}
                maxChoices={poll.maxChoices}
                selectedIds={selectedIds}
                onToggle={toggleOption}
              />
              {errors.selection && (
                <p className="mt-2 font-body text-sm text-cocoa" role="alert">
                  {errors.selection}
                </p>
              )}
            </div>

            {poll.suggestionsEnabled && (
              <button
                type="button"
                onClick={() => setSuggestOpen(true)}
                className="mt-4 font-body text-sm font-bold text-teal-deep hover:underline"
              >
                Suggest something else
              </button>
            )}

            <div className="fixed inset-x-0 bottom-0 border-t-[length:var(--border-divider)] border-dashed border-cream-deep bg-cream-deep/95 p-4 backdrop-blur">
              <div className="mx-auto max-w-content">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleCastClick}
                  disabled={selectedIds.length === 0 || !name.trim()}
                >
                  {selectedIds.length === 0 || !name.trim()
                    ? "Cast my vote"
                    : `Cast my vote for ${selectedIds
                        .map((id) => poll.options.find((o) => o.id === id)?.label)
                        .join(" and ")}`}
                </Button>
              </div>
            </div>
          </>
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
