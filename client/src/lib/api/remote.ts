import type {
  CastVoteInput,
  CastVoteResult,
  CreatePollInput,
  Option,
  Poll,
  PollDetail,
  PollResults,
  PollSummary,
  PublicPoll,
  ReopenPollInput,
  SuggestOptionInput,
} from "@tiebreak/shared";
import type { PollsApi } from "./types";

/**
 * The real implementation, calling the Express API the backend build order
 * describes (see TODO.md). Routes 404 until each one is built — that's
 * expected; `guestApi` is what makes the app demoable in the meantime.
 */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

const POLL_RESULTS_INTERVAL_MS = 4000;

export const remoteApi: PollsApi = {
  listPolls: () => request<PollSummary[]>("/polls"),
  getPoll: (pollId) => request<PollDetail>(`/polls/${pollId}`),
  createPoll: (input: CreatePollInput) => request<Poll>("/polls", { method: "POST", body: JSON.stringify(input) }),

  getPublicPoll: (slug) => request<PublicPoll>(`/p/${slug}`),
  getResults: (slug) => request<PollResults>(`/p/${slug}/results`),

  subscribeToResults(slug, onUpdate) {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (pollTimer) return;
      const tick = () => {
        void request<PollResults>(`/p/${slug}/results`).then((r) => !cancelled && onUpdate(r));
      };
      tick();
      pollTimer = setInterval(tick, POLL_RESULTS_INTERVAL_MS);
    };

    let source: EventSource | null = null;
    try {
      source = new EventSource(`/api/p/${slug}/stream`);
      source.onmessage = (event) => {
        if (cancelled) return;
        onUpdate(JSON.parse(event.data) as PollResults);
      };
      source.onerror = () => {
        source?.close();
        source = null;
        startPolling();
      };
    } catch {
      startPolling();
    }

    return () => {
      cancelled = true;
      source?.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  },

  castVote: (slug, input: CastVoteInput) =>
    request<CastVoteResult>(`/p/${slug}/votes`, { method: "POST", body: JSON.stringify(input) }),

  suggestOption: (slug, input: SuggestOptionInput) =>
    request<Option>(`/p/${slug}/suggestions`, { method: "POST", body: JSON.stringify(input) }),

  approveSuggestion: (pollId, optionId) =>
    request<Option>(`/polls/${pollId}/suggestions/${optionId}/approve`, { method: "POST" }),
  declineSuggestion: (pollId, optionId) =>
    request<void>(`/polls/${pollId}/suggestions/${optionId}/decline`, { method: "POST" }),
  restoreSuggestion: (pollId, optionId) =>
    request<Option>(`/polls/${pollId}/suggestions/${optionId}/restore`, { method: "POST" }),

  settlePoll: (pollId) => request<Poll>(`/polls/${pollId}/settle`, { method: "POST" }),
  reopenPoll: (pollId, input: ReopenPollInput) =>
    request<Poll>(`/polls/${pollId}/reopen`, { method: "POST", body: JSON.stringify(input) }),
};
