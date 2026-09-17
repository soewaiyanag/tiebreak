# Tiebreak — Build Plan

Step-by-step implementation guide for the full-stack path. Work top to bottom.
Claude keeps this file current: ticking boxes as we finish, and reading it at the
start of each session to know where we are.

## Division of labor (changed 2026-09-17)

**The entire frontend (`client/`) is built** — Claude owns it fully now, no
teaching zone there. **The backend (`server/`) is still yours to learn**, under
`LEARNING.md`'s usual protocol. Phases 2–6 below are rewritten as a **backend
build order**: every frontend page already calls the real API it needs via
`client/src/lib/api/remote.ts` — those calls 404 until you build the matching
route. `shared/src/types.ts` is the contract: request/response shapes for every
endpoint, importable from both workspaces. `guestApi`
(`client/src/lib/api/guest.ts`) is a full client-side simulation of the same
rules, which is how the frontend got built and verified before any backend
route existed — it's demo-only, never the contract itself.

Not built in this pass, deliberately: **Sudden Death** and **Share Card**
differentiator UI, and stretch #11/#12/#14 (saved identity, 30-day retention,
dark mode). Sudden Death's differentiator section below is unchanged — do it as
a follow-up once the core loop works end to end.

## How to read this

- `[ ]` not started · `[~]` in progress · `[x]` done
- 🎓 **teaching zone** — Claude explains the concept first, hands you a skeleton
  with `// TODO` on the lines that carry the idea, you attempt, one retry, then
  the fix. (See `LEARNING.md`.)
- 🔧 **autopilot** — Claude just builds it; flags any new library in one line.
- **Ref:** points at the mockup spec sheet / brand kit / spec file to build from.
- **Unblocks:** the frontend page(s) that start working once this route exists.

## Stack (decided)

- Monorepo (yarn workspaces): `client/` Vite + React SPA · `server/` Express API ·
  `shared/` types (added when first needed)
- DB: **Neon Lakebase Postgres** · Auth: **Neon Auth** (managed Better Auth) ·
  ORM: **Drizzle**
- Live results: **SSE** from the Express server (differentiator #1)
- Deploy: client → Vercel · server → Railway
- Differentiators: **Truly Live Results** (SSE), **Sudden Death** (linked tiebreak poll)

## References

- Screen mockup + spec sheet (routes, API map, redlines): the "Tiebreak Product
  Mockup" artifact
- Component/token reference: the "Tiebreak Design Kit" artifact
- `guidance/brand-kit.md` · `guidance/patterns.md` · `guidance/accessibility.md`
- `spec/technical-requirements.md` (state machine, vote integrity, avatars)
- `data/sample-polls.json` + `data/README.md` (seed shape)

---

## Product rules to decide (fill these in as we hit them)

These have no single right answer; the README's "Product Rules I Decided" section
wants them. Decided during the frontend build — the backend should match these,
since the UI already assumes them:

- [x] **Reopening a poll** → the creator must set a **new closing time**; the old
      deadline has already passed by definition, so reopening without one would
      leave the poll open forever with no honest countdown. `ReopenModal` requires
      it and won't submit without a future date. `POST /api/polls/:id/reopen`
      takes `{ closesAt }` (see `ReopenPollInput` in `shared/src/types.ts`) —
      **reject the request server-side if `closesAt` is missing or in the past**,
      the same way `castVote` must reject a vote after close.
- [x] **One-vote line** for account-less voters → a random token in `localStorage`
      (`client/src/lib/voter-token.ts`), sent with every vote. The server enforces
      it via `UNIQUE(poll_id, voter_token)` (already in `schema.ts`). Two browsers
      = two votes, accepted by design — this is pizza night, not an election.
- [x] **Results past ~20 voters** → the segmented per-voter tally switches to
      counts + relative bars only at **N = 20** total votes
      (`SEGMENTED_TALLY_THRESHOLD` in `client/src/lib/tally.ts`). The server
      doesn't need to know this — it's a pure presentation decision made from the
      vote counts the results endpoint already returns.
- [x] **Declined suggestions** → the option row stays (`suggestionStatus:
      "declined"`), never hard-deleted, so the undo toast can restore it. Backend
      needs a `POST /api/polls/:id/suggestions/:sid/restore` route (sets the
      status back to `"pending"`) — see Phase 5 below; `guestApi` already
      implements this exact behavior as the reference.
- [x] **Post-vote** → yes, a voter sees live standings immediately after casting,
      with their own pick flagged ("You backed Veggie supreme"). Chosen on
      purpose: seeing the race is part of the fun. Same view on a return visit
      while the poll's still open — read-only, no takebacks. See design
      challenge 1's write-up below.
- [ ] **Sudden death ties again** → another round, or a coin-flip moment —
      undecided, out of scope for this pass (see the differentiator section).

---

## Phase 0 — Foundations

- [x] Monorepo restructure: `client/` + `server/` workspaces, `.nvmrc`, yarn install
- [x] Client: Tailwind v4 (PostCSS) + `tokens.css` wired, bare shell renders, build green
- [x] ~~Server: Hono skeleton~~ — **switched to Express** (2026-09-14): the goal is
      re-learning React + Express, not learning a new framework on top of relearning.
      CORS + health logic ported 1:1 and re-verified (same 5 scenarios: dev
      matching/attacker origin, prod unset/set/matching/attacker — all pass, no
      crash). Note for later: the earlier Hono attempt had a real gotcha worth
      remembering even though it's gone now — Hono's `cors()` spreads an explicit
      `origin: undefined` over its own `"*"` default and then calls `.includes()`
      on it, crashing with a 500. Express's `cors` package takes a callback
      (`(origin, cb) => cb(err, allow)`) instead, so `allow: false` just denies
      cleanly — no equivalent trap.
- [x] 🎓 Fill the two `// TODO`s in `server/src/app.ts` (CORS origin, `/api/health` body) —
      verified: health returns `{status, timestamp}`; CORS allows only the configured
      origin, denies everyone else, no crash when `CLIENT_ORIGIN` is unset
- [x] 🔧 `NODE_ENV` set explicitly in `server/package.json` (`development` for `dev`,
      `production` for `start`) — needed so the CORS ternary's prod branch is
      actually reachable at deploy time, not just an accident of an unset var
- [x] 🔧 Confirm the dev loop: `yarn dev` runs both; `curl localhost:5173/api/health`
      reaches the server through the Vite proxy — verified, matches the direct
      port-3000 response
- [x] 🔧 Drizzle wiring started: `drizzle-orm` + `pg` + `drizzle-kit` installed,
      `server/drizzle.config.ts` (migrations over `DATABASE_URL_UNPOOLED`),
      `server/src/db/client.ts` (pooled connection), `db:generate`/`db:migrate`/
      `db:studio`/`db:seed` scripts added — `schema.ts` is a placeholder until Phase 1
- [x] 🔧 `shared/` workspace with `src/types.ts` — `Poll`/`Option`/`Vote`/
      `PollResults` and every request/response DTO the frontend calls against
      (`CreatePollInput`, `CastVoteInput`, `CastVoteResult`, etc.). This is the
      API contract — build routes to match these shapes exactly.
- [ ] 🔧 `.env.example` at root documenting every var (`DATABASE_URL`,
      `DATABASE_URL_UNPOOLED`, `NEON_AUTH_*`, `CLIENT_ORIGIN`, `PORT`)

**Phase 0 core loop is done** — monorepo, client shell, and server are all
wired and verified end to end.

## Phase 1 — Schema & data layer  ·  hard problem #1

**Ref:** spec sheet "API" table, `spec/technical-requirements.md` → Database.

- [x] 🔧 Add `drizzle-orm` + `pg` + `drizzle-kit` to `server/`; `drizzle.config.ts`
      (migrations over `DATABASE_URL_UNPOOLED`, the direct connection)
- [x] 🔧 `server/src/db/client.ts` — a `pg` Pool on `DATABASE_URL` (pooled), one
      instance reused
- [x] 🎓 `server/src/db/schema.ts` — you write the concept-bearing parts:
  - [x] `polls` — `status` enum (`open` | `settled`), `type` enum (`single` |
        `multi`), `maxChoices`, `closesAt` (timestamptz, UTC), `settledAt`,
        `suggestionsEnabled`, `parentPollId` (nullable self-FK, for sudden death)
  - [x] `options` — `source` enum (`creator` | `suggestion`), `suggestionStatus`
        enum (`null` | `pending` | `approved` | `declined`), `suggestedByName` /
        `suggestedBySeed` / `suggestedByTint`, `displayOrder`
  - [x] `votes` — `optionId`, `voterName`, `voterSeed`, `voterTint`, `voterToken`,
        `castAt`; **`UNIQUE(pollId, voterToken)`** (the casual one-vote rule)
  - [x] `ON DELETE CASCADE` from poll → options → votes
- [ ] 🎓 Derived-state helpers (pure functions, unit-testable):
  - [ ] `effectiveStatus(poll, now)` → `settled` if `status = 'settled'` OR
        `now >= closesAt` (settle-at-read-time; no cron)
  - [ ] `tallyFromVotes(votes, options)` → counts, leader, `aheadBy`, tie detection
- [ ] 🔧 `drizzle-kit generate` + `migrate`; verify tables on a Neon **branch**
      first, then the `production` branch
- [ ] 🔧 Seed script from `data/sample-polls.json` — shift every timestamp
      relative to `now()` (keep the offsets), so open polls are genuinely open
- [ ] ✅ Checkpoint: recap the state machine + what "enforced server-side" means here

## Phase 2 — Auth + poll CRUD

**Unblocks:** Login, Signup, Dashboard, New poll, Share step (all already built,
all calling `remoteApi` and currently 404ing).

- [ ] 🎓 Neon Auth wiring: mount Better Auth's Express handler at `/api/auth/*`
      (the client already points here — `client/src/lib/auth-client.ts`,
      `baseURL: "/api/auth"`) and a middleware that verifies the session/JWT
      against `NEON_AUTH_JWKS_URL`, attaching the user to `req` (e.g.
      `req.user`). Concept: JWKS verification. Once this lands, `Login`/`Signup`
      (`authClient.signIn.email` / `signUp.email`) start working as-is — no
      frontend changes needed.
- [ ] 🔧 `POST /api/polls` — body is `CreatePollInput`, response is `Poll`
      (both in `shared/src/types.ts`). Attach `req.user` as creator.
- [ ] 🔧 `GET /api/polls` — creator's list, response `PollSummary[]`
      (`id, slug, title, status, closesAt, settledAt, totalVotes,
      pendingSuggestionCount` — derive the last two from `votes`/`options`,
      never store them)
- [ ] 🔧 `GET /api/polls/:id` — creator's full poll, response `PollDetail`
      (`Poll & { options, results }`) — includes pending suggestions; `results`
      uses the same shape Phase 4 defines below
- [ ] ✅ Checkpoint: Dashboard, poll creation, and the share step all work
      end to end against real data

## Phase 3 — The vote page's write path

**Unblocks:** the ballot state of `/p/:slug` (built, currently 404ing on submit).
Design challenge 1 (the voter's three states) is already designed and built on
the frontend — see the "Post-vote" decision above; nothing left to design here,
just make the reads/writes real.

- [ ] 🔧 `GET /api/p/:slug` — public poll, response `PublicPoll`. **Never**
      include pending suggestions (`ballotOf` in `client/src/lib/poll-options.ts`
      shows exactly which options belong: `source === "creator"` or
      `suggestionStatus === "approved"`)
- [ ] 🎓 `POST /api/p/:slug/votes` — body `CastVoteInput`, response
      `CastVoteResult` (`{ alreadyVoted, results }`). The guarded transition:
  - [ ] reject if `effectiveStatus(poll) !== 'open'` (server-side, ignore
        whatever the client thinks the status is)
  - [ ] idempotent per `voterToken` — if a vote already exists for
        `(pollId, voterToken)`, return `{ alreadyVoted: true, results }`
        instead of erroring or double-inserting
  - [ ] ⚠️ **known schema gap:** `votes` currently has
        `UNIQUE(pollId, voterToken)`, which only allows **one row per voter per
        poll** — fine for `single`, but a `multi` (pick-up-to-N) vote needs one
        row per selected option, same voter. You'll likely need
        `UNIQUE(pollId, voterToken, optionId)` instead, or a different shape for
        multi-choice ballots. Worth deciding before writing this route.
- [ ] ✅ Checkpoint: cast a vote against the real backend, refresh, confirm the
      already-voted state holds

## Phase 4 — Results & live updates  ·  hard problem #2 + differentiator #1

**Unblocks:** live tallies on both the creator's poll view and the voter's
post-vote view — both already render `PollResults` via `presentTally()`
(`client/src/lib/tally.ts`), which computes leader/aheadBy/tie/pack-widths from
raw counts. That presentation logic is done; this phase is purely about
producing the counts.

- [ ] 🔧 `GET /api/p/:slug/results` — response `PollResults`. **Counts only
      while open** (`tallies`, `voterCrew` — identity without their choice —
      `lastVoteAt`); **add `attribution`** (who backed each option) only once
      `effectiveStatus === 'settled'`. This open/closed split is what makes
      "who voted for what is revealed at close" actually true server-side, not
      just a UI convention.
- [ ] 🔧 Same endpoint powers the creator's `GET /api/polls/:id` `results`
      field — reuse the same query/computation, don't duplicate it
- [ ] 🎓 `GET /api/p/:slug/stream` (differentiator #1, optional but the client
      is already built for it) — SSE endpoint (`text/event-stream`), a
      per-poll subscriber set, emit on vote + moderation. The client
      (`client/src/lib/api/remote.ts` → `subscribeToResults`) already tries
      `EventSource` first and **silently falls back to polling every 4s** if
      the stream 404s or errors — so shipping this is a pure upgrade, no
      frontend changes needed either way. Concepts: SSE framing, keep-alive,
      reconnect/catch-up without double-sending.
- [ ] ✅ Checkpoint: watch two browser tabs — one voting, one on the creator's
      poll view — and confirm the tally updates without a manual refresh

## Phase 5 — Suggestions, moderation, closing & the reveal  ·  design challenge 2

**Unblocks:** the "Suggest something else" modal, the pending-suggestion cards
and Add it/Not this time buttons, End voting, Reopen voting, and the settled
reveal — all built (`client/src/components/poll/{SuggestModal,
PendingSuggestionCard, Reveal, ReopenModal}.tsx`). Design challenge 2 (the
reveal, the tie panel, the Copy result payload) is already designed and built —
see `client/src/lib/reveal-text.ts` for the exact Copy result wording and
`RevealTie.tsx`/`RevealWinner.tsx` for the tie vs. winner layouts.

- [ ] 🔧 `POST /api/p/:slug/suggestions` (public) — body `SuggestOptionInput`,
      response `Option` with `suggestionStatus: "pending"`. Reject if
      `!poll.suggestionsEnabled` or the poll isn't open.
- [ ] 🎓 `POST /api/polls/:id/suggestions/:optionId/approve` — flips
      `suggestionStatus` to `"approved"` (option is now live, 0 votes since no
      `votes` rows reference it yet). Reject if not currently `"pending"`.
- [ ] 🎓 `POST /api/polls/:id/suggestions/:optionId/decline` — flips to
      `"declined"`. **Do not delete the row** — the frontend's undo toast calls
      `restoreSuggestion` right after, which needs it to still exist (see the
      "Declined suggestions" decision above).
- [ ] 🔧 `POST /api/polls/:id/suggestions/:optionId/restore` — flips back to
      `"pending"`. This is what backs the undo toast's "Undo" button
      (`client/src/routes/PollView.tsx` → `resolveSuggestion`, 8-second window
      via `ToastProvider`).
- [ ] 🎓 `POST /api/polls/:id/settle` — sets `status: "settled"`,
      `settledAt: now()`. Also implement settle-**at-read-time**: any route
      that reads a poll should compute `effectiveStatus` from `closesAt`
      even if this route was never called (mirrors
      `server/src/db/poll-state.ts`'s `effectiveStatus`, which you already
      wrote — reuse it here).
- [ ] 🎓 `POST /api/polls/:id/reopen` — body `ReopenPollInput` (`{ closesAt }`,
      **required**, must be in the future — see the "Reopening a poll"
      decision above). Sets `status: "open"`, `settledAt: null`,
      `closesAt: input.closesAt`.
- [ ] ✅ Checkpoint: approve a suggestion, decline one and undo it, end voting
      early, reopen with a new time — confirm each against the real backend

## Phase 6 — Deploy

Guest mode, the landing page, first-run empty state, responsive layout, and the
full accessibility pass (headings, focus rings, contrast, live regions, page
titles, touch targets) are **already built and audited** on the frontend —
nothing left to do there. This phase is deployment only.

- [ ] 🔧 Deploy — client → Vercel (root `client/`), server → Railway (root
      `server/`), env vars set, CORS locked to the client origin, register the
      deploy domain with Neon Auth trusted domains
- [ ] 🔧 Seed the deployed database from `data/sample-polls.json` (shift
      timestamps relative to `now()`, keep the offsets) — this is a separate
      concern from `guestApi`'s client-side seeding, which only ever touches
      `localStorage` and never the real database
- [ ] 🔧 Perf — vote page interactive <3s mobile, Lighthouse ≥85 perf / ≥90 a11y
      on the **vote page** (not just landing); code-split routes if needed
- [ ] 🔧 Test the shared-link flow from a real phone: create a poll, text
      yourself the link, vote from the sofa
- [ ] ✅ Final checkpoint

## Differentiator — Sudden Death

**Ref:** PollResult tie frame, `spec/differentiators.md` #3.

- [ ] 🎓 `POST /api/polls/:id/tiebreak` — detect the tie, create a linked child
      poll (tied options only, short window, `parentPollId` set), same share link
- [ ] 🔧 Tie reveal → "Break the tie" / "Leave it tied"; child poll runs the normal
      lifecycle; reveal acknowledges the two-round story
- [ ] 🔧 Decide + handle "ties again" (decision above)
- [ ] ✅ README write-up (state-machine stretch: a poll that spawns a poll)

## Cross-cutting (check continuously, not once)

- [x] WCAG 2.2 AA — audited across the built frontend: heading hierarchy,
      semantic lists, focus-visible rings, the tangerine-scrim contrast rule,
      44px touch targets, unique page titles, failed-action retry states.
      Re-check anything new you add on the backend side that changes response
      shapes (e.g. don't let an API error message leak a stack trace to a guest).
- [x] One tangerine moment per screen — held: `LeaderCard`/`RevealWinner` (the
      leader/winner), `VoteBallotView`'s Cast my vote button, `Dashboard`'s
      empty-state Create button. Nowhere else uses `bg-tangerine`.
- [x] Every % has its count; every tie is words; no full-width leader bar —
      `presentTally()` and `SegmentedTally`/`PackBar` enforce this structurally
- [x] `prefers-reduced-motion` honoured on the reveal's entrance animation
      (`motion-reduce:animate-none` in `Reveal.tsx`)
- [ ] README "Development Journey" + "AI Collaboration" notes — still to write;
      the design decisions above (reopening, one-vote line, the >20-voter
      threshold, declined-suggestion recovery, post-vote standings) are ready
      to drop straight into "Product Rules I Decided"

## Deploy readiness checklist

- [ ] `yarn build` green for both workspaces — `client/` is green now;
      `server/` still has the open `tallyFromVotes` TODO blocking it
- [ ] No secrets in the client bundle (client never sees `DATABASE_URL`)
- [ ] Incognito test: guest experience + vote page from a phone
- [ ] Submit the **guest URL** (`/guest`), not the landing page
