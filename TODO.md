# Tiebreak — Build Plan

Step-by-step implementation guide for the full-stack path. Work top to bottom.
Claude keeps this file current: ticking boxes as we finish, and reading it at the
start of each session to know where we are.

## How to read this

- `[ ]` not started · `[~]` in progress · `[x]` done
- 🎓 **teaching zone** — Claude explains the concept first, hands you a skeleton
  with `// TODO` on the lines that carry the idea, you attempt, one retry, then
  the fix. (See `LEARNING.md`.)
- 🔧 **autopilot** — Claude just builds it; flags any new library in one line.
- **Ref:** points at the mockup spec sheet / brand kit / spec file to build from.

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
wants them. Decide deliberately, record here.

- [ ] **Reopening a poll** → what happens to the closing time? (recommend: creator
      sets a new one) — decision: _______
- [ ] **One-vote line** for account-less voters → `voterToken` in a cookie +
      `UNIQUE(poll_id, voter_token)`; two browsers = two votes, accepted. Confirm
      wording for the README — decision: _______
- [ ] **Results past ~20 voters** → tally degrades; switch to counts + relative
      bars at N = ___ — decision: _______
- [ ] **Declined suggestions** → keep a `declined` row (recoverable for undo) vs
      hard delete after the toast — decision: _______
- [ ] **Post-vote** → does a voter see live standings after casting? (mockup
      proposes yes, with their pick flagged) — decision: _______
- [ ] **Sudden death ties again** → another round, or a coin-flip moment — decision: _______

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
- [ ] 🔧 Add `shared/` workspace with a `types.ts` (Poll, Option, Vote, enums) —
      created when Phase 1 defines the shapes
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

## Phase 2 — Auth, dashboard shell, poll creation

**Ref:** routes `/login /signup /app /app/new /app/polls/:id/share`.

- [ ] 🎓 Neon Auth wiring: client Better Auth SDK for sign in/up/out; an Express
      middleware that verifies the JWT against `NEON_AUTH_JWKS_URL` and attaches
      the user to `req` (e.g. `req.user`). Concept: JWKS verification.
- [ ] 🔧 Client routing: React Router; `/app/*` guarded (redirect to `/login?next=`)
- [ ] 🔧 `POST /api/polls` (creator) + `GET /api/polls` (creator's list) + Drizzle queries
- [ ] 🔧 `GET /api/polls/:id` (creator, full poll incl. pending suggestions)
- [ ] 🔧 Dashboard populated view — split open/settled, compute "closing soonest",
      surface pending-suggestion counts. **Ref:** Dashboard frame + measurements.
- [ ] 🔧 Poll creation form — freeform title, 2–10 options, closing time,
      single/pick-up-to-N, suggestions toggle; inline validation (≥2 options,
      closing time in future). **Ref:** PollCreateForm frame.
- [ ] 🔧 Share step — truncated link + Copy button (`role="status"` "Link copied",
      focus stays). **Ref:** ShareStep frame.
- [ ] ✅ Checkpoint

## Phase 3 — The vote page  ·  design challenge 1

**Ref:** `/p/:slug` frames (ballot · confirm · voted), `guidance/patterns.md` → The Vote Page.

- [ ] 🔧 `GET /api/p/:slug` — public poll + options; **counts only while open,
      never voter lists**
- [ ] 🎓 `POST /api/p/:slug/votes` — the guarded transition:
  - [ ] reject if `effectiveStatus === 'settled'` (server-side, ignore client)
  - [ ] idempotent per `voterToken` — `INSERT … ON CONFLICT (pollId, voterToken)
        DO NOTHING`, return existing state
  - [ ] `multi` polls: enforce `maxChoices`
- [ ] 🔧 Vote page — status header, name field, avatar + tint picker
      (DiceBear `micah`; store `{seed, tint}`), fieldset of radios, nothing
      pre-selected, unmistakable selected state, sticky dock CTA that restates
      the choice and is disabled until name + selection
- [ ] 🔧 Confirm step — real modal dialog (`role="dialog" aria-modal`, focus
      trap, Esc, focus return). Cast → set cookie → voted state
- [ ] 🔧 Already-voted detection on load (cookie) → voted state, not a 2nd ballot
- [ ] 🔧 Avatar failure → tinted circle fallback, never a gap
- [ ] 🎓 **Design challenge 1** — decide + build: post-vote moment, return visit,
      latecomer/closed state (all share `/p/:slug`; state = f(status, cookie)).
      Discuss trade-offs first; write the rationale for the README.
- [ ] ✅ Checkpoint + README write-up

## Phase 4 — Live results + SSE  ·  hard problem #2 + differentiator #1

**Ref:** `/app/polls/:id` PollLiveView frame + measurements, brand kit → Data Viz Rules.

- [ ] 🔧 `GET /api/p/:slug/results` — counts while open; adds attribution once settled
- [ ] 🔧 Results UI: segmented per-voter tally (N ticks, `aria-hidden`, numbers in
      text), pack bars **relative to the leader**, `45% · 5 of 11 votes` pairs
      everywhere, tabular-nums, tie stated in words
- [ ] 🎓 `GET /api/p/:slug/stream` — SSE endpoint (`text/event-stream`), a
      per-poll subscriber set, emit on vote + moderation. Concepts: SSE framing,
      keep-alive, cleanup on disconnect.
- [ ] 🎓 Client `EventSource` — apply updates without stealing focus/scroll;
      tick stamp-in; pack re-sort with a settle transition; reconnect + catch-up
      without double-animating
- [ ] 🔧 One throttled polite live region for the summary; nothing announces per-vote
- [ ] 🔧 Document the >~20-voter presentation switch (decision above)
- [ ] ✅ Checkpoint + README (honest data viz + live region behaviour)

## Phase 5 — Suggestions, moderation, closing & the reveal  ·  design challenge 2

**Ref:** PollLiveView pending card, PollResult frames (settled · tie · latecomer).

- [ ] 🔧 `POST /api/polls/:id/suggestions` (public) — new option, `status = pending`
- [ ] 🔧 Vote-page "Suggest something else" modal → posts; "Suggested by X"
      everywhere (never "write-in")
- [ ] 🎓 `…/suggestions/:sid/approve` · `/decline` (creator, guarded):
      approve → option live at **0 votes**; decline → recoverable for the undo;
      reject if already ruled on
- [ ] 🔧 Moderation UI — Add it / Not this time; announce outcome; move focus
      deliberately; decline toast with Undo (generous timeout)
- [ ] 🎓 `POST /api/polls/:id/settle` (early) + auto-settle at read time; both paths
- [ ] 🎓 `POST /api/polls/:id/reopen` — confirm step; new closing time (decision above)
- [ ] 🔧 Copy result — the text-summary payload (distinct from Copy link); spec
      both payloads so the labels are earned
- [ ] 🎓 **Design challenge 2** — the reveal: how settled differs from live, the
      winner moment, attribution at close, the tie state, motion budget +
      `prefers-reduced-motion`. Write the Copy result text first. Rationale → README.
- [ ] ✅ Checkpoint + README write-up

## Phase 6 — First run, landing, guest, polish, deploy  ·  design challenge 3

- [ ] 🎓 **Design challenge 3** — first-run empty dashboard (the one earned filled
      tangerine button), the share step as the pivotal moment, the
      one-open-zero-votes state. Rationale → README.
- [ ] 🔧 Landing page — product in the brand voice, no fake logos/testimonials,
      "Try as guest" + sign up/login
- [ ] 🔧 Guest mode — `/app` seeded read-only from `sample-polls.json`
- [ ] 🔧 Responsive pass — every screen 320px+, no horizontal scroll, 44px targets,
      vote page at 375px, 200% zoom
- [ ] 🔧 A11y pass against `guidance/accessibility.md` — keyboard end-to-end,
      screen-reader vote flow, focus management on moderation, one live region,
      `<html lang>`, headings, landmarks, skip link, unique page titles
- [ ] 🔧 Perf — vote page interactive <3s mobile, Lighthouse ≥85 perf / ≥90 a11y
      on the **vote page** (not just landing); code-split routes, lazy avatars
- [ ] 🔧 Deploy — client → Vercel (root `client/`), server → Railway (root
      `server/`), env vars set, CORS locked to the client origin, register the
      deploy domain with Neon Auth trusted domains, seed guest data
- [ ] 🔧 Test the shared-link flow from a real phone
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

- [ ] WCAG 2.2 AA on every feature as it lands (it's not a final-week sweep)
- [ ] One tangerine moment per screen — audit each screen
- [ ] Every % has its count; every tie is words; no full-width leader bar
- [ ] `prefers-reduced-motion` honoured on the dot, tally stamp-in, bar
      transitions, the reveal
- [ ] README "Development Journey" + "AI Collaboration" notes written as we go,
      not after

## Deploy readiness checklist

- [ ] `yarn build` green for both workspaces
- [ ] No secrets in the client bundle (client never sees `DATABASE_URL`)
- [ ] Incognito test: guest experience + vote page from a phone
- [ ] Submit the **guest URL** (e.g. `.../app` guest), not the landing page
