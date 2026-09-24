# Tiebreak — Build Plan

## Status (2026-09-24): both `client/` and `server/` are fully built

Frontend and backend are both done and verified end to end against the real
Neon database — see "Division of labor" below for how that happened in two
stages. What's left is genuinely optional: the two differentiators not yet
built (Sudden Death, Share Card), a couple of stretch features, and deploying
it live. Everything in Phases 0–5 below is implemented; kept as a record of
what was built and why, and as the map for the optional work that remains.

## Division of labor

**2026-09-17 — the frontend became fully Claude-owned.** Every page was
built against `shared/src/types.ts`'s contract, calling real API routes via
`client/src/lib/api/remote.ts`. `guestApi` (`client/src/lib/api/guest.ts`) is
a full client-side simulation of the same rules — demo-only, never the
contract itself — which is how the frontend got built and verified before
any backend route existed.

**2026-09-24 — the backend became Claude-owned too.** The original plan (see
history below) had the user learning the backend hands-on, teaching-zone
style. That changed: "I would like to learn with another project but for
this project I would like to learn by reading what you implemented and how
you implemented so also build the backend completely until the project is
functional." So `server/` is now fully built — see "What got built" below.
Their hands-on backend learning continues on a separate project instead.

## What got built (server/)

Structured as a plain-Express, NestJS-*flavored* layered architecture — no
decorators or DI container (that's a real framework's job, and would've been
complexity for its own sake here), just the same separation of concerns:
class-based, static methods throughout.

```
server/src/
  db/            schema.ts, client.ts — Drizzle models + the pooled connection
  common/        errors.ts (HttpError), poll-state.ts (PollState), mappers.ts
                 (Mappers), queries.ts (PollQueries), slug.ts (Slug), sse.ts (SseHub)
  middleware/    auth.middleware.ts (AuthMiddleware) — JWKS verification
  services/      polls.service.ts, public.service.ts, results.service.ts —
                 business logic + DB access, no req/res
  controllers/   polls.controller.ts, public.controller.ts — req/res glue only
  routes/        polls.routes.ts, public.routes.ts — Router wiring only
```

Errors: every service throws `HttpError` (`.notFound()`, `.conflict()`, etc.)
for an expected failure; Express 5 forwards a rejected promise from any async
handler straight to `app.ts`'s error-handling middleware automatically — no
per-route try/catch, the same job a Nest exception filter does without
needing the framework.

**Auth — corrected from the original plan.** Neon Auth is a *hosted* service:
the browser talks to it directly (`client/src/lib/auth-client.ts`, via
`@neondatabase/neon-js/auth`, pointed at `NEON_AUTH_BASE_URL` — **not** a
same-origin `/api/auth` path proxied through this server, which was the
original assumption below and was wrong). This server never issues sessions;
`auth.middleware.ts` only verifies the JWT the client sends
(`Authorization: Bearer <token>`, minted via `authClient.token()`) against
`NEON_AUTH_JWKS_URL` using `jose`. Verified against
https://neon.com/guides/react-neon-auth-hono.

**Schema fix:** `votes` had `UNIQUE(pollId, voterToken)`, flagged below as
only allowing one row per voter per poll — doesn't fit `multi` (pick-up-to-N)
polls needing multiple option rows per voter. Fixed to
`UNIQUE(pollId, voterToken, optionId)`; idempotency ("already voted") is
checked at the application level in `PublicService.castVote` instead
(a `SELECT` for any existing row before insert), since the constraint alone
can no longer distinguish "this voter's ballot is already in" from "this
exact row exists." Migrated and verified against the real `production` branch.

**Not seeded:** `data/sample-polls.json` was never loaded into the real
database. Its creator ("Morgan") isn't a real Neon Auth user, and seeding it
under a fake `creatorId` would create data no real account owns for no
functional benefit — `guestApi` already covers the demo experience entirely
client-side. If real sample data is wanted later, seed it under an actual
signed-up account's id.

**Verified live**, via a real signed-up test account and `curl` (no browser
available this session) — created cleaned up afterward: sign-up → JWT →
create a poll → creator detail → public ballot → cast a vote → idempotent
re-vote → suggest → approve (+ reject-if-already-ruled-on) → decline → undo
(restore) → settle → results swap `voterCrew` for `attribution` exactly at
settle → vote-after-close correctly rejected → reopen requires a future date
→ SSE push confirmed live on a vote → multi-choice vote (2 rows, same voter)
confirms the schema fix.

## How to read the rest of this file

- `[ ]` not started · `[~]` in progress · `[x]` done
- **Ref:** points at the mockup spec sheet / brand kit / spec file to build from.
- **Unblocks:** the frontend page(s) that start working once this route exists.

## Stack (decided)

- Monorepo (yarn workspaces): `client/` Vite + React SPA · `server/` Express API ·
  `shared/` types
- DB: **Neon Lakebase Postgres** · Auth: **Neon Auth** (managed Better Auth,
  hosted — see above) · ORM: **Drizzle**
- Live results: **SSE** from the Express server (differentiator #1) — built
- Deploy: client → Vercel · server → Railway (not yet done)
- Differentiators: **Truly Live Results** (SSE, built) · **Sudden Death**
  (linked tiebreak poll, not yet built)

## References

- Screen mockup + spec sheet (routes, API map, redlines): the "Tiebreak Product
  Mockup" artifact
- Component/token reference: the "Tiebreak Design Kit" artifact
- `guidance/brand-kit.md` · `guidance/patterns.md` · `guidance/accessibility.md`
- `spec/technical-requirements.md` (state machine, vote integrity, avatars)
- `data/sample-polls.json` + `data/README.md` (seed shape)

---

## Product rules decided

These have no single right answer; the README's "Product Rules I Decided"
section wants them — all implemented as described:

- [x] **Reopening a poll** → the creator must set a **new closing time**;
      enforced server-side in `PollsService.reopen` (400 if missing or not
      in the future), matching `ReopenModal`'s client-side requirement.
- [x] **One-vote line** for account-less voters → a random token in
      `localStorage` (`client/src/lib/voter-token.ts`), checked at the
      application level in `PublicService.castVote` before insert. Two
      browsers = two votes, accepted by design.
- [x] **Results past ~20 voters** → the segmented per-voter tally switches to
      counts + relative bars only at **N = 20** total votes
      (`SEGMENTED_TALLY_THRESHOLD` in `client/src/lib/tally.ts`) — a pure
      frontend presentation decision; the results endpoint just returns counts.
- [x] **Declined suggestions** → the option row stays
      (`suggestionStatus: "declined"`), restorable via
      `POST /api/polls/:id/suggestions/:optionId/restore`
      (`PollsService.restoreSuggestion`, only from `"declined"`).
- [x] **Post-vote** → a voter sees live standings immediately after casting,
      own pick flagged. Read-only on a return visit while still open.
- [ ] **Sudden death ties again** → another round, or a coin-flip moment —
      undecided, out of scope until Sudden Death itself is built.

---

## Phase 0 — Foundations

- [x] Monorepo restructure: `client/` + `server/` + `shared/` workspaces,
      `.nvmrc`, yarn install
- [x] Client: Tailwind v4 (PostCSS) + `tokens.css` wired
- [x] Server: Express, CORS, `/api/health`
- [x] `shared/` workspace — `Poll`/`Option`/`Vote`/`PollResults` and every
      request/response DTO both workspaces build against
- [x] `.env.example` at root documenting every var

## Phase 1 — Schema & data layer · hard problem #1

- [x] `server/src/db/schema.ts` — `polls`/`options`/`votes`, all four enums,
      cascading deletes, `UNIQUE(pollId, voterToken, optionId)` (fixed from
      the original `UNIQUE(pollId, voterToken)` — see "Schema fix" above)
- [x] `common/poll-state.ts`'s `PollState` — `effectiveStatus` (settle-at-
      read-time) and `tallyFromVotes` (counts, leaders, `aheadBy`)
- [x] Migrated to the real Neon `production` branch (`yarn db:generate` +
      `yarn db:migrate`) — verified via `neon psql`
- [x] Sample-data seeding — deliberately skipped; see "Not seeded" above

## Phase 2 — Auth + poll CRUD

- [x] Neon Auth wiring — `auth.middleware.ts`'s `AuthMiddleware.verify`
      (JWKS verification via `jose`); client via `@neondatabase/neon-js/auth`
      (see "Auth — corrected" above for why this differs from the original plan)
- [x] `POST /api/polls`, `GET /api/polls`, `GET /api/polls/:id` —
      `PollsService.create` / `.list` / `.getById`

## Phase 3 — The vote page's write path

- [x] `GET /api/p/:slug` — `PublicService.getPublicPoll`, pending
      suggestions correctly excluded
- [x] `POST /api/p/:slug/votes` — `PublicService.castVote`: rejects a closed
      poll, idempotent per `voterToken`, enforces `maxChoices`

## Phase 4 — Results & live updates · hard problem #2 + differentiator #1

- [x] `GET /api/p/:slug/results` and `GET /api/polls/:id`'s `results` field —
      both call `ResultsService.build`, one implementation
- [x] `GET /api/p/:slug/stream` — SSE via `common/sse.ts`'s `SseHub`,
      confirmed live push on vote

## Phase 5 — Suggestions, moderation, closing & the reveal · design challenge 2

- [x] `POST /api/p/:slug/suggestions` — `PublicService.suggestOption`
- [x] Approve / decline / restore — `PollsService.approveSuggestion` /
      `.declineSuggestion` / `.restoreSuggestion`, each rejecting an
      already-ruled-on suggestion
- [x] `POST /api/polls/:id/settle`, `POST /api/polls/:id/reopen` —
      `PollsService.settle` / `.reopen`

## Phase 6 — Deploy (not started)

Everything else is built and verified locally against the real database.
This phase is the only thing actually left to do for a live submission.

- [ ] 🔧 Deploy — client → Vercel (root `client/`), server → Railway (root
      `server/`), env vars set, CORS locked to the client origin, register the
      deploy domain with Neon Auth trusted domains (`neon neon-auth domain add`)
- [ ] 🔧 Perf — vote page interactive <3s mobile, Lighthouse ≥85 perf / ≥90 a11y
      on the **vote page** (not just landing); the client bundle is currently
      ~920KB (up from ~380KB before `@neondatabase/neon-js`) — worth
      code-splitting the auth-only pages (Login/Signup) via `React.lazy` if
      this misses the perf target
- [ ] 🔧 Test the shared-link flow from a real phone: create a poll, text
      yourself the link, vote from the sofa
- [ ] ✅ Final checkpoint

## Differentiator — Sudden Death (not built, optional)

**Ref:** PollResult tie frame, `spec/differentiators.md` #3.

- [ ] `POST /api/polls/:id/tiebreak` — detect the tie, create a linked child
      poll (tied options only, short window, `parentPollId` set), same share link
- [ ] Tie reveal → "Break the tie" / "Leave it tied"; child poll runs the normal
      lifecycle; reveal acknowledges the two-round story
- [ ] Decide + handle "ties again" (decision above)
- [ ] README write-up (state-machine stretch: a poll that spawns a poll)

## Cross-cutting (check continuously, not once)

- [x] WCAG 2.2 AA — audited across the built frontend: heading hierarchy,
      semantic lists, focus-visible rings, the tangerine-scrim contrast rule,
      44px touch targets, unique page titles, failed-action retry states
- [x] One tangerine moment per screen — held throughout
- [x] Every % has its count; every tie is words; no full-width leader bar
- [x] `prefers-reduced-motion` honoured (reveal entrance, hover/press
      micro-interactions added 2026-09-18)
- [ ] README "Development Journey" + "AI Collaboration" notes — still to
      write; the "Product rules decided" section above is ready to drop in

## Deploy readiness checklist

- [x] `yarn build` green for both workspaces
- [x] No secrets in the client bundle — `NEON_AUTH_BASE_URL`/`NEON_AUTH_JWKS_URL`
      are public URLs by design; `DATABASE_URL` never reaches Vite
- [ ] Incognito test: guest experience + vote page from a phone
- [ ] Submit the **guest URL** (`/guest`), not the landing page
