import type { Avatar, Option, Poll, PollStatus, Vote } from "@tiebreak/shared";

/**
 * The guest-mode "database": everything lives in localStorage, seeded once
 * from public/sample-polls.json (a copy of data/sample-polls.json — see
 * data/README.md for the shape). This is what makes the whole product
 * demoable — and every screen buildable and testable in-browser — before
 * any backend route exists. It deliberately re-implements the state-machine
 * rules described in spec/technical-requirements.md, scoped to this file
 * only, so it's never mistaken for the real server contract.
 */

export interface GuestStore {
  polls: Poll[];
  options: Option[];
  votes: Vote[];
}

const STORAGE_KEY = "tiebreak:guest-store:v1";

/** The sample data is written as if "now" were this instant (data/README.md). */
const SAMPLE_DATA_REFERENCE_NOW = "2026-09-17T15:00:00Z";

interface RawSamplePoll {
  id: string;
  title: string;
  type: Poll["type"];
  maxChoices: number;
  suggestionsEnabled: boolean;
  status: PollStatus;
  createdAt: string;
  closesAt: string;
  settledAt: string | null;
  options: Array<{
    id: string;
    label: string;
    source: Option["source"];
    suggestionStatus?: Option["suggestionStatus"];
    suggestedBy?: { name: string; avatar: { seed: string; tint: string } };
  }>;
  votes: Array<{
    optionId: string;
    voter: { name: string; avatar: { seed: string; tint: string } };
    voterToken: string;
    castAt: string;
  }>;
}

interface RawSampleData {
  creator: { name: string; avatar: { seed: string; tint: string } };
  polls: RawSamplePoll[];
}

function shift(iso: string | null, offsetMs: number): string | null {
  if (iso === null) return null;
  return new Date(new Date(iso).getTime() + offsetMs).toISOString();
}

async function seed(): Promise<GuestStore> {
  const res = await fetch("/sample-polls.json");
  const data: RawSampleData = await res.json();

  const offsetMs = Date.now() - new Date(SAMPLE_DATA_REFERENCE_NOW).getTime();

  const polls: Poll[] = [];
  const options: Option[] = [];
  const votes: Vote[] = [];

  for (const p of data.polls) {
    polls.push({
      id: p.id,
      slug: p.id,
      title: p.title,
      type: p.type,
      maxChoices: p.maxChoices,
      suggestionsEnabled: p.suggestionsEnabled,
      status: p.status,
      createdAt: shift(p.createdAt, offsetMs)!,
      closesAt: shift(p.closesAt, offsetMs)!,
      settledAt: shift(p.settledAt, offsetMs),
      parentPollId: null,
    });

    for (const [index, o] of p.options.entries()) {
      options.push({
        id: o.id,
        pollId: p.id,
        label: o.label,
        displayOrder: index,
        source: o.source,
        suggestionStatus: o.suggestionStatus ?? null,
        suggestedBy: o.suggestedBy
          ? { name: o.suggestedBy.name, avatar: o.suggestedBy.avatar as Avatar }
          : null,
      });
    }

    for (const v of p.votes) {
      votes.push({
        id: crypto.randomUUID(),
        pollId: p.id,
        optionId: v.optionId,
        voter: { name: v.voter.name, avatar: v.voter.avatar as Avatar },
        voterToken: v.voterToken,
        castAt: shift(v.castAt, offsetMs)!,
      });
    }
  }

  const store: GuestStore = { polls, options, votes };
  save(store);
  return store;
}

export function load(): GuestStore | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GuestStore;
  } catch {
    return null;
  }
}

export function save(store: GuestStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  notify();
}

export async function getOrSeedStore(): Promise<GuestStore> {
  return load() ?? seed();
}

export function resetGuestStore(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Settle-at-read-time (spec/technical-requirements.md), mirrored client-side for the demo. */
export function effectiveStatus(poll: Poll, now: Date = new Date()): PollStatus {
  if (poll.status === "settled") return "settled";
  return new Date(poll.closesAt) <= now ? "settled" : "open";
}

// ---- change notifications, so subscribeToResults() can react to local mutations ----

const listeners = new Set<() => void>();

export function onStoreChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(): void {
  for (const fn of listeners) fn();
}
