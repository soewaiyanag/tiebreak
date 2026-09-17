/**
 * Local record of "this browser already voted on this poll, for these
 * options" — set right after a successful cast so a return visit shows the
 * already-voted state instead of a second ballot, with no network round
 * trip needed just to check (spec/technical-requirements.md "Vote Integrity").
 */

const STORAGE_PREFIX = "tiebreak:voted:";

export interface VotedRecord {
  optionIds: string[];
  voterName: string;
}

export function getVotedRecord(slug: string): VotedRecord | null {
  const raw = localStorage.getItem(STORAGE_PREFIX + slug);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VotedRecord;
  } catch {
    return null;
  }
}

export function setVotedRecord(slug: string, record: VotedRecord): void {
  localStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(record));
}
