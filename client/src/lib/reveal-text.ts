import type { Identity } from "@tiebreak/shared";

/** "Priya, Ada, Kai + 2 more backed it" — credit the crew without listing all eleven names. */
export function backersLine(voters: Identity[]): string {
  if (voters.length === 0) return "Nobody backed it";
  const shown = voters.slice(0, 3).map((v) => v.name);
  const rest = voters.length - shown.length;
  const names = rest > 0 ? `${shown.join(", ")} + ${rest} more` : shown.join(", ");
  return `${names} backed it`;
}

interface CopyResultInput {
  title: string;
  isTie: boolean;
  winners: { label: string; votes: number }[];
  totalVotes: number;
}

/** The "Copy result" payload — distinct from Copy link, a text summary for the group chat. */
export function copyResultText({ title, isTie, winners, totalVotes }: CopyResultInput): string {
  if (isTie) {
    const names = winners.map((w) => w.label).join(" and ");
    return `${title} — tied at ${winners[0]?.votes ?? 0} votes each between ${names}. Still anyone's game.`;
  }
  const winner = winners[0];
  if (!winner) return `${title} — no votes yet.`;
  const percentage = totalVotes === 0 ? 0 : Math.round((winner.votes / totalVotes) * 100);
  return `${title} — ${winner.label} won with ${winner.votes} of ${totalVotes} votes (${percentage}%).`;
}
