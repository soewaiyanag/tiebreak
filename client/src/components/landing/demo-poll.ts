import type { AvatarTint, Identity, OptionTally, PollResults, PublicOption } from "@tiebreak/shared";

/** The landing page's sample poll: the same Pizza night the guest demo opens with (11 votes, Detroit-style ahead). */
const face = (name: string, tint: AvatarTint): Identity => ({ name, avatar: { seed: name, tint } });

export const DEMO_CREW: Identity[] = [
  face("Priya", "f8c9b9"),
  face("Jonah", "cbe2d8"),
  face("Ada", "f6e0a4"),
  face("Sam", "e3d2f2"),
  face("Kai", "cbe2d8"),
  face("Lena", "f8c9b9"),
  face("Marcus", "f6e0a4"),
  face("Elif", "e3d2f2"),
  face("Noor", "cbe2d8"),
  face("Theo", "f8c9b9"),
  face("Rosa", "f6e0a4"),
];

export const DEMO_YOU = face("You", "e3d2f2");

export const DEMO_TITLE = "Pizza night: what are we ordering?";

export const DEMO_OPTIONS: PublicOption[] = [
  { id: "detroit", label: "Detroit-style from Emmy's", source: "suggestion", suggestedBy: DEMO_CREW[0] },
  { id: "pepperoni", label: "Pepperoni from Slice House", source: "creator", suggestedBy: null },
  { id: "veggie", label: "Veggie supreme from Nino's", source: "suggestion", suggestedBy: DEMO_CREW[1] },
  { id: "margherita", label: "Margherita from Lupa", source: "creator", suggestedBy: null },
];

// Who backed what: 5 / 3 / 2 / 1, eleven voters in all.
const BACKERS: Record<string, Identity[]> = {
  detroit: [DEMO_CREW[0], DEMO_CREW[2], DEMO_CREW[4], DEMO_CREW[8], DEMO_CREW[10]],
  pepperoni: [DEMO_CREW[5], DEMO_CREW[6], DEMO_CREW[7]],
  veggie: [DEMO_CREW[1], DEMO_CREW[3]],
  margherita: [DEMO_CREW[9]],
};

/** Results for the demo poll, with the visitor's vote added when they've cast one. */
export function demoResults(status: "open" | "settled", extraVoteFor: string | null = null): PollResults {
  const tallies: OptionTally[] = DEMO_OPTIONS.map((o) => ({
    optionId: o.id,
    votes: BACKERS[o.id].length + (o.id === extraVoteFor ? 1 : 0),
  }));
  const results: PollResults = {
    pollId: "landing-demo",
    status,
    totalVotes: tallies.reduce((sum, t) => sum + t.votes, 0),
    tallies,
    lastVoteAt: new Date().toISOString(),
  };
  if (status === "open") results.voterCrew = extraVoteFor ? [...DEMO_CREW, DEMO_YOU] : DEMO_CREW;
  else results.attribution = DEMO_OPTIONS.map((o) => ({ optionId: o.id, voters: BACKERS[o.id] }));
  return results;
}
