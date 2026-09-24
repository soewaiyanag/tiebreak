# Tiebreak

A group polling app — create a poll, share a link, the group votes, ties get settled. Work in progress, built openly as a learning project rather than presented as finished.

## Status

- **Frontend** (`client/`) — built: poll creation, a share flow, a guest ballot, live results, and a creator dashboard behind a login (`better-auth`). Built with AI assistance; right now it runs against a local, in-browser simulation of the real API so the UI is fully demoable before the backend catches up.
- **Backend** (`server/`) — in progress, and this part I'm building myself, route by route, specifically to learn Express + Drizzle + Postgres properly rather than have it generated. Most routes are still stubs (`TODO.md` tracks exactly which).
- **Deploy** — not live yet. Planned: client → Vercel, server → Railway (Postgres via Neon).

## Stack

React 19 · TypeScript · React Router · better-auth · Tailwind CSS — Express · Drizzle ORM · PostgreSQL (Neon) — Yarn workspaces monorepo (`client/` / `server/` / `shared/`).

## Why it's split this way

The frontend came together fast with AI help. The backend is deliberately where I slowed down: the poll state machine and the "honest results" logic (never leaking pending suggestions to voters, deriving vote counts instead of storing them) are the parts worth actually understanding, so `LEARNING.md` in this repo is the protocol I set for myself to make sure I'm reasoning through those before any code gets written for them, not just approving a diff.
