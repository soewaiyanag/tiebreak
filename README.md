# Tiebreak

A group polling app — create a poll, share a link, the group votes, ties get settled honestly instead of picked by a coin flip.

**Live:** https://tiebreak-soewaiyanag.vercel.app

## Status

- **Frontend** (`client/`) — built: poll creation, a share flow, live results, a creator dashboard behind login, and a guest mode that runs the whole product against a local in-browser simulation so it's demoable with zero setup.
- **Backend** (`server/`) — built: layered Express + Drizzle + PostgreSQL API (routes → controllers → services, Nest-flavored but framework-free), real Neon Auth integration, the settle-at-read-time poll state machine, and derived (never stored) vote tallies.
- **Deploy** — live. Client and server ship as two Vercel Services in one project (`vercel.json`), same origin, no CORS hop. Database on Neon.

The live site runs **standalone** while the backend is rebuilt: every feature works against an in-browser store, with nothing to sign up for (polls stay in your browser). Builds with `VITE_API_MODE=remote` talk to the real API instead.

## Stack

React 19 · TypeScript · React Router · Tailwind CSS — Express 5 · Drizzle ORM · PostgreSQL (Neon) · Neon Auth — Yarn workspaces monorepo (`client/` / `server/` / `shared/`) — deployed on Vercel.

## Why it's split this way

The frontend came together fast. The backend is where the actual product logic lives: the poll state machine and the "honest results" rule (never leaking pending suggestions to voters, deriving vote counts from votes instead of storing a running tally) are enforced server-side, not just in the UI — a creator dashboard can't fake a result the database doesn't back.

## Roadmap

In progress on the `backend/nestjs-mongo` branch: a realtime backend rebuilt in
**NestJS + MongoDB**, with **Socket.IO** for live results, **BullMQ on Redis**
to close polls at their deadline, **Google sign-in**, and **Testcontainers**
tests, shipped as a **Docker** image on **Fly.io**. It's ported endpoint by
endpoint against the contract the client already uses, then gains **Sudden
Death** (a tied poll spawns a short revote between only the tied options).
`main` stays on the current Express + PostgreSQL API until the new one reaches
parity. Checklist and decisions: `PROGRESS.md` on that branch.

## Running locally

```bash
yarn install
cp .env.example .env.local   # fill in DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_JWKS_URL
yarn dev
```

`yarn dev` runs the client (Vite) and server (Express, via `tsx watch`) together. Set `VITE_API_MODE=remote` in `.env.local` so the client uses that server instead of the in-browser demo store.
