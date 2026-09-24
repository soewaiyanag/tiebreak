import { Router, type Request, type Response } from "express";
import type { CastVoteInput, Option, SuggestOptionInput } from "@tiebreak/shared";

export const publicRouter = Router();

/**
 * GET /api/p/:slug — the public ballot.
 *
 * Frontend: client/src/routes/Vote.tsx (fetched on mount, alongside getResults)
 * Purpose: the poll a voter sees before casting — title, options, closing time.
 *   **Never** include pending suggestions here; only `source === "creator"` or
 *   `suggestionStatus === "approved"` options belong on the ballot (see
 *   `client/src/lib/poll-options.ts`'s `ballotOf` for the exact filter the
 *   frontend already applies to the creator's full option list — mirror it
 *   server-side so a guest never even receives a pending suggestion's data).
 * Response: PublicPoll (shared/src/types.ts)
 */
publicRouter.get("/:slug", async (_req: Request<{ slug: string }>, res: Response) => {
  // TODO(you): look up the poll by slug, 404 if not found, map to PublicPoll
  res.status(501).json({ message: "not implemented" });
});

/**
 * GET /api/p/:slug/results — live results for one poll.
 *
 * Frontend: Vote.tsx (initial load) and, via subscribeToResults's polling
 *   fallback, both Vote.tsx and PollView.tsx every ~4s while a poll is open
 *   (client/src/lib/api/remote.ts)
 * Purpose: vote counts. **Counts only while open** — `tallies` + `voterCrew`
 *   (who voted, never what they picked). Once `effectiveStatus(poll, now)`
 *   is "settled", also include `attribution` (who backed each option). This
 *   open/closed split is the actual server-side enforcement of "who voted
 *   for what is revealed at close" — see spec/technical-requirements.md.
 * Response: PollResults (shared/src/types.ts)
 */
publicRouter.get("/:slug/results", async (_req: Request<{ slug: string }>, res: Response) => {
  // TODO(you): compute tallies from votes (tallyFromVotes in db/poll-state.ts
  // gets you most of the way — you'll need to reshape its Tally into
  // PollResults's `tallies: OptionTally[]`), then branch open vs settled
  res.status(501).json({ message: "not implemented" });
});

/**
 * GET /api/p/:slug/stream — SSE live updates (differentiator #1, optional).
 *
 * Frontend: PollView.tsx and Vote.tsx, via subscribeToResults
 *   (client/src/lib/api/remote.ts) — it tries `new EventSource(...)` here
 *   first and **silently falls back to polling /results every 4s** if this
 *   404s or errors. Shipping this later is a pure upgrade with zero frontend
 *   changes required either way, so it's safe to leave for last.
 * Purpose: push a fresh PollResults to every open tab watching this poll the
 *   moment a vote lands or a suggestion is moderated, instead of waiting for
 *   the next poll interval.
 * Response: `text/event-stream`, each message a JSON-encoded PollResults
 *   (the client does `JSON.parse(event.data) as PollResults`)
 */
publicRouter.get("/:slug/stream", async (_req: Request<{ slug: string }>, res: Response) => {
  // TODO(you): set headers for SSE, keep a per-slug subscriber set, write
  // `data: ${JSON.stringify(results)}\n\n` on connect and on every change,
  // clean up the subscriber on `req.on("close", ...)`
  res.status(501).end();
});

/**
 * POST /api/p/:slug/votes — cast a vote. The guarded transition.
 *
 * Frontend: Vote.tsx's handleConfirmVote, fired from ConfirmVoteModal
 *   (client/src/routes/Vote.tsx)
 * Purpose: the one write every other feature in the product exists to
 *   protect. Reject if the poll isn't open (server-side, ignore whatever the
 *   client thinks). Idempotent per voterToken — a second call with the same
 *   token must not double-count, it should just return the existing result.
 * Request: CastVoteInput — { voterName, voterAvatar, voterToken, optionIds }
 * Response: CastVoteResult — { alreadyVoted, results }
 *
 * ⚠️ See TODO.md Phase 3 — the current votes table's
 * UNIQUE(pollId, voterToken) only allows one row per voter per poll, which
 * doesn't fit `multi` (pick-up-to-N) polls needing multiple option rows per
 * voter. Worth resolving before writing this handler.
 */
publicRouter.post(
  "/:slug/votes",
  async (_req: Request<{ slug: string }, unknown, CastVoteInput>, res: Response) => {
    // TODO(you): find the poll, reject if effectiveStatus !== "open", check
    // for an existing vote with req.body.voterToken (-> alreadyVoted: true,
    // same results, no insert), otherwise insert one votes row per
    // req.body.optionIds and return the fresh results
    res.status(501).json({ message: "not implemented" });
  },
);

/**
 * POST /api/p/:slug/suggestions — a voter proposes an option.
 *
 * Frontend: Vote.tsx's handleSuggest, fired from SuggestModal
 *   (client/src/components/poll/SuggestModal.tsx)
 * Purpose: the signature feature. Creates a new option with
 *   suggestionStatus: "pending" — not on the ballot until the creator
 *   approves it (see routes/polls.ts's approve/decline/restore).
 * Request: SuggestOptionInput — { label, suggestedBy: { name, avatar } }
 * Response: Option (shared/src/types.ts), the new pending option
 */
publicRouter.post(
  "/:slug/suggestions",
  async (_req: Request<{ slug: string }, Option, SuggestOptionInput>, res: Response) => {
    // TODO(you): reject if poll.suggestionsEnabled is false or the poll
    // isn't open; otherwise insert an options row from req.body,
    // source: "suggestion", suggestionStatus: "pending"
    res.status(501).json({ message: "not implemented" });
  },
);
