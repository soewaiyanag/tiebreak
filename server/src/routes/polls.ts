import { Router, type Request, type Response } from "express";
import type { CreatePollInput, ReopenPollInput } from "@tiebreak/shared";

/**
 * Every route in this file is creator-only — mount it behind the auth
 * middleware in app.ts (see middleware/require-auth.ts), which attaches
 * `req.user` before any of these handlers run. None of them should ever be
 * reachable by an anonymous voter; that's what routes/public.ts is for.
 */
export const pollsRouter = Router();

/**
 * POST /api/polls — create a poll.
 *
 * Frontend: client/src/routes/PollCreate.tsx's handleSubmit
 * Purpose: the whole poll-creation form in one call — title, 2-10 options,
 *   closing time, single vs pick-up-to-N, suggestions toggle. Attach
 *   `req.user` as the creator; generate a URL-safe `slug` (see
 *   `client/src/lib/api/guest-selectors.ts`'s `slugify` for the exact
 *   approach the frontend's own demo mode uses — kebab-case the title, add a
 *   short random suffix to avoid collisions).
 * Request: CreatePollInput — { title, type, maxChoices, suggestionsEnabled,
 *   closesAt, options: string[] }
 * Response: Poll (shared/src/types.ts) — the frontend immediately navigates
 *   to /app/polls/:id/share using the returned `id`
 */
pollsRouter.post("/", async (_req: Request<Record<string, never>, unknown, CreatePollInput>, res: Response) => {
  // TODO(you): insert a polls row from req.body, then one options row per
  // req.body.options (source: "creator"), return the created Poll
  res.status(501).json({ message: "not implemented" });
});

/**
 * GET /api/polls — the creator's dashboard list.
 *
 * Frontend: client/src/routes/Dashboard.tsx (fetched on mount)
 * Purpose: every poll `req.user` created, for the open/closed tabs. Derive
 *   `totalVotes` and `pendingSuggestionCount` from `votes`/`options` at read
 *   time — never store them (same "derive, don't denormalize" rule as
 *   results). The dashboard sorts and features the soonest-closing open poll
 *   client-side, so ordering here doesn't matter much.
 * Response: PollSummary[] (shared/src/types.ts)
 */
pollsRouter.get("/", async (_req: Request, res: Response) => {
  // TODO(you): query polls where creatorId = req.user.id, map each to a
  // PollSummary (status via effectiveStatus, not the raw column)
  res.status(501).json({ message: "not implemented" });
});

/**
 * GET /api/polls/:id — one poll, full creator detail.
 *
 * Frontend: PollView.tsx (poll detail + live results) and PollShare.tsx
 *   (the share-link step) both fetch this
 * Purpose: everything the creator's poll view needs in one call — the poll,
 *   *all* its options including pending suggestions (unlike the public
 *   GET /api/p/:slug, which must never leak those), and `results`.
 * Response: PollDetail (shared/src/types.ts) — `Poll & { options, results }`.
 *   Reuse whatever you build for GET /api/p/:slug/results (routes/public.ts)
 *   for the `results` field instead of duplicating that query.
 */
pollsRouter.get("/:id", async (_req: Request<{ id: string }>, res: Response) => {
  // TODO(you): look up the poll by id + creatorId (404 or 403 if it's not
  // req.user's poll), include every option regardless of suggestionStatus
  res.status(501).json({ message: "not implemented" });
});

/**
 * POST /api/polls/:id/settle — end voting early (or confirm it's settled).
 *
 * Frontend: PollView.tsx's endVoting, fired from LivePollBody's "End voting"
 *   button
 * Purpose: sets status: "settled", settledAt: now(). Remember this is only
 *   half the story — a poll also becomes settled automatically once
 *   `closesAt` passes, with nobody calling this route at all. Every read
 *   path (this route included, and GET /:id, and the public results route)
 *   should compute the *effective* status via `effectiveStatus()`
 *   (server/src/db/poll-state.ts, already written) rather than trusting the
 *   stored column blindly.
 * Response: Poll (shared/src/types.ts), now settled
 */
pollsRouter.post("/:id/settle", async (_req: Request<{ id: string }>, res: Response) => {
  // TODO(you): set status + settledAt on the poll (creator-owned only)
  res.status(501).json({ message: "not implemented" });
});

/**
 * POST /api/polls/:id/reopen — undo a settle. Confirmed client-side already.
 *
 * Frontend: SettledPollBody.tsx's ReopenModal, wired through PollView.tsx's
 *   reopen handler
 * Purpose: the creator's biggest undo. **Requires a new closing time** — see
 *   TODO.md's "Reopening a poll" decision: the old deadline has already
 *   passed by definition, so reject the request if `closesAt` is missing or
 *   not in the future, the same way castVote rejects a vote after close.
 * Request: ReopenPollInput — { closesAt }
 * Response: Poll (shared/src/types.ts), now open again
 */
pollsRouter.post(
  "/:id/reopen",
  async (_req: Request<{ id: string }, unknown, ReopenPollInput>, res: Response) => {
    // TODO(you): validate req.body.closesAt is present and in the future,
    // then set status: "open", settledAt: null, closesAt: req.body.closesAt
    res.status(501).json({ message: "not implemented" });
  },
);

/**
 * POST /api/polls/:id/suggestions/:optionId/approve — moderate: accept.
 *
 * Frontend: PollView.tsx's resolveSuggestion("approve"), fired from
 *   PendingSuggestionCard's "Add it" button
 * Purpose: flips suggestionStatus to "approved" — the option is now on the
 *   public ballot, at 0 votes (no votes rows reference it yet, so nothing
 *   else needs to change). Reject if it isn't currently "pending" (e.g.
 *   someone already ruled on it).
 * Response: Option (shared/src/types.ts), now approved
 */
pollsRouter.post(
  "/:id/suggestions/:optionId/approve",
  async (_req: Request<{ id: string; optionId: string }>, res: Response) => {
    // TODO(you): update the option's suggestionStatus to "approved"
    res.status(501).json({ message: "not implemented" });
  },
);

/**
 * POST /api/polls/:id/suggestions/:optionId/decline — moderate: decline.
 *
 * Frontend: PollView.tsx's resolveSuggestion("decline") — also immediately
 *   shows an undo toast (ToastProvider) that, if clicked, calls the /restore
 *   route below within an 8-second window
 * Purpose: flips suggestionStatus to "declined". **Do not delete the row** —
 *   the undo toast needs it to still exist to restore it. See TODO.md's
 *   "Declined suggestions" decision.
 * Response: 204 No Content (the frontend doesn't read a body back)
 */
pollsRouter.post(
  "/:id/suggestions/:optionId/decline",
  async (_req: Request<{ id: string; optionId: string }>, res: Response) => {
    // TODO(you): update the option's suggestionStatus to "declined"
    res.status(501).json({ message: "not implemented" });
  },
);

/**
 * POST /api/polls/:id/suggestions/:optionId/restore — undo a decline.
 *
 * Frontend: the undo toast's "Undo" button, wired through PollView.tsx's
 *   resolveSuggestion's onAction callback
 * Purpose: flips a "declined" option back to "pending" — puts it back in
 *   front of the creator to rule on again, rather than restoring it straight
 *   to "approved" (declining, then undoing, shouldn't silently approve it).
 * Response: Option (shared/src/types.ts), now pending again
 */
pollsRouter.post(
  "/:id/suggestions/:optionId/restore",
  async (_req: Request<{ id: string; optionId: string }>, res: Response) => {
    // TODO(you): update the option's suggestionStatus back to "pending"
    res.status(501).json({ message: "not implemented" });
  },
);
