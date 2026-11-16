# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Portfolio reviewers (primary audience for the public site).** Recruiters, hiring engineers and Frontend Mentor reviewers judging the build. They decide from the landing page and a short click through the demo whether the craft, product thinking and engineering are real. Confirmed by the owner as the audience to win over first.
- **The organizer.** The friend who makes the plan happen: creates a poll (often at a desk, sometimes on a phone), pastes the link into WhatsApp or Discord, watches the race, moderates suggestions and calls time. The only role with an account.
- **The voter.** Arrives from a shared link, almost always on a phone, mid-conversation, with no account and never wanting one. Types a name, picks a face, votes, goes back to the chat. The vote page must be self-explanatory in about five seconds.
- **The latecomer.** Taps the link after voting closed. The most common real edge case: they land on a settled result that tells the story, never an error page.

Groups are small and polls short-lived: typically 3–15 voters, decided in hours.

## Product Purpose

Tiebreak settles group decisions: a poll goes from created to decided inside a single group-chat conversation. It is a portfolio project (a Frontend Mentor product challenge), so it must also prove, to a reviewer, product judgement, honest small-n data presentation, a server-enforced state machine and crafted motion.

## Positioning

Social, not administrative. Polling tools are either enterprise survey builders or joyless utilities; Tiebreak is a game night, not a form:

- voters suggest options and the creator approves or declines them, so the poll is a conversation;
- every voter has a name and a face, so eleven votes read as eleven friends;
- closing the poll is a reveal built to be screenshotted back into the chat.

## Operating Context

- Links are shared into group chats (WhatsApp, Discord) and opened on phones.
- Live site: tiebreak-soewaiyanag.vercel.app, which runs in standalone mode (guest demo in the browser, no backend required).
- Sample dataset: one creator (Morgan), five polls (pizza order, film night, dinner date, Airbnb, brunch), from `data/sample-polls.json`; the landing page uses the Pizza-night poll.

## Capabilities and Constraints

- Poll lifecycle: open → settled → reopened; suggestions pending → approved/declined; votes are final. The server is the referee.
- Honest live results at small counts: per-voter tallies, a count beside every percentage, bars relative to the leader, ties stated in words.
- No accounts for voters; casual duplicate-vote prevention via a voter token.
- UI copy says "Suggested by X", never "write-in".
- Stack is an existing monorepo (Vite + React client, Express server; a NestJS + MongoDB rebuild in progress on a separate branch).

## Brand Commitments

- Name: Tiebreak. Logo: a tie broken by a slash.
- `guidance/brand-kit.md` is binding: the shipped identity (color roles, Gabarito + Karla, game-piece controls, data-viz rules) is extended, never replaced. Confirmed by the owner.
- Voice: friendly, plain, a little playful; "settle it in the group chat".

## Evidence on Hand

- Real: the live demo, the sample Pizza-night poll, and the app's own components rendered on the landing page.
- None: no testimonials, user counts, customer logos, press or ratings exist. Never invent any.

## Product Principles

1. The vote page works first time for someone who has never seen the app and never will again.
2. Small numbers, told honestly: never spin eleven votes into a landslide.
3. Personality serves the moment (the face, the stamp, the reveal) and never slows the voter down.
4. Show the real product rather than describe it: demos are built from the shipping components.
5. Craft must be legible to a reviewer: purposeful, restrained, and evidently deliberate.

## Accessibility & Inclusion

WCAG 2.2 AA is core, not stretch (`guidance/accessibility.md`). Every animation respects `prefers-reduced-motion` with an authored still version; one polite live region for the race; live updates never steal focus or scroll position.
