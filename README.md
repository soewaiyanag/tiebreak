# Tiebreak

A group polling app — create a poll, share a link, the group votes, ties get settled honestly instead of picked by a coin flip.

**Live:** https://tiebreak-two.vercel.app

## Status

- **Frontend** (`client/`) — built: poll creation, a share flow, live results, a creator dashboard behind login, and a guest mode that runs the whole product against a local in-browser simulation so it's demoable with zero setup.
- **Backend** (`server/`) — built: layered Express + Drizzle + PostgreSQL API (routes → controllers → services, Nest-flavored but framework-free), real Neon Auth integration, the settle-at-read-time poll state machine, and derived (never stored) vote tallies.
- **Deploy** — live. Client and server ship as two Vercel Services in one project (`vercel.json`), same origin, no CORS hop. Database on Neon.

Try it at `/guest` for the no-setup simulation, or sign up for the real thing.

## Stack

React 19 · TypeScript · React Router · Tailwind CSS — Express 5 · Drizzle ORM · PostgreSQL (Neon) · Neon Auth — Yarn workspaces monorepo (`client/` / `server/` / `shared/`) — deployed on Vercel.

## Why it's split this way

The frontend came together fast with AI help. The backend is where the actual product logic lives: the poll state machine and the "honest results" rule (never leaking pending suggestions to voters, deriving vote counts from votes instead of storing a running tally) are enforced server-side, not just in the UI — a creator dashboard can't fake a result the database doesn't back.

## Running locally

```bash
yarn install
cp .env.example .env.local   # fill in DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_JWKS_URL
yarn dev
```

`yarn dev` runs the client (Vite) and server (Express, via `tsx watch`) together.
