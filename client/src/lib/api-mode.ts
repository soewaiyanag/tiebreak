/**
 * Unless a build sets VITE_API_MODE=remote, the whole app runs on the
 * in-browser demo store (the same one "Try the demo" uses): polls, votes and
 * suggestions live in this browser, and accounts are switched off. That keeps
 * the deployed site fully working while the backend is rebuilt. Set
 * VITE_API_MODE=remote in .env.local to talk to a real API instead.
 */
export const STANDALONE = import.meta.env.VITE_API_MODE !== "remote";
