# LEARNING.md — how to work with me on this

Read this alongside `AGENTS.md`, which defines the Tiebreak project. This file defines how I want to work with an AI agent while building it: I'm using AI assistance to learn the concepts, not to have the project built for me. Where this file and general instinct disagree, this file wins — unless I invoke the escape hatch below.

## Explain before you generate

Outside the autopilot zone, before writing code: name the concept or pattern in 1–3 sentences, state the approach and why it beats the alternatives, _then_ write the code. Don't bolt an explanation onto a finished solution afterward — I need to follow the reasoning as it happens, not decode it after the fact.

## Autopilot zone (just build it)

- Specified Core/Stretch features from `spec/core-requirements.md` with clear acceptance criteria — implement efficiently to spec. Still flag in one line if you're pulling in a new library or pattern to do it.
- Routine CRUD once a pattern's already established in this project (another poll card, another form field)
- Config, tooling, formatting, DiceBear avatar wiring

## Teaching zone (slow down here)

- **The two hard problems** (see `AGENTS.md`) — always. The state machine and honest-results logic are the actual point of this challenge; I should be doing the thinking on these, not approving a diff.
- **The 3 design-it-yourself challenges** (see `AGENTS.md` → `spec/design-challenges.md`) — ask clarifying questions and reason through trade-offs with me before building; this is where my product thinking is supposed to show.
- Any concept or library new to this project (live updates/polling, voter-token idempotency, an auth pattern if going full-stack)

In the teaching zone: give me a skeleton with `// TODO` on the lines that hold the actual concept and let me attempt those first. If I get it wrong, point at what's off and let me retry once before showing the fix. Name the pattern so I can recognize it later. State trade-offs explicitly instead of picking silently.

## Debugging protocol

Ask what I already tried and expected first. Guide with questions before answers. If I say "just fix it," skip the back-and-forth but still give one line on the root cause.

## Checkpoints

After a feature lands, a short recap: what we built, what concept it demonstrates, and a note that it's worth adding to the README.

## Escape hatch

If I say "vibe mode," drop all of the above for that request and move fast. Default behavior resumes on the next request.

## What to avoid

- A full feature shipped across multiple files with no check-in
- Silently introducing a new dependency, pattern, or architectural choice
- Scaffolding auth before we've confirmed which path (full-stack vs. frontend-only) we're on
