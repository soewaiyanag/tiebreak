/**
 * The casual one-vote-per-browser mechanism (spec/technical-requirements.md
 * "Vote Integrity"): a random token stored per poll slug, sent with every
 * vote so the server can reject a second cast from the same browser. A
 * determined friend voting from two browsers is accepted by design — this
 * is pizza night, not an election.
 */

const STORAGE_PREFIX = "tiebreak:voter-token:";

export function getVoterToken(slug: string): string | null {
  return localStorage.getItem(STORAGE_PREFIX + slug);
}

export function getOrCreateVoterToken(slug: string): string {
  const existing = getVoterToken(slug);
  if (existing) return existing;
  const token = crypto.randomUUID();
  localStorage.setItem(STORAGE_PREFIX + slug, token);
  return token;
}
