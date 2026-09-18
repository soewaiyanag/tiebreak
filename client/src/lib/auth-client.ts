import { createAuthClient } from "better-auth/react";

/**
 * Better Auth's client SDK (TODO.md Phase 2: "client Better Auth SDK for sign
 * in/up/out"). Sign-in/up/out calls here will fail with a network error until
 * the server mounts the Better Auth handler and verifies sessions against
 * Neon Auth — that's the user's backend TODO, not this file's.
 *
 * No `baseURL` passed on purpose: better-auth's client does `new URL(baseURL)`
 * internally, which throws synchronously on a relative path like "/api/auth"
 * (no protocol/host — that's not a valid absolute URL). Left unset, it falls
 * back to `window.location.origin + "/api/auth"`, which is exactly right in
 * dev (the Vite proxy forwards /api/* to the Express server) and same-origin
 * deploys. If client and server end up on different production domains,
 * this needs a real absolute URL from an env var instead.
 */
export const authClient = createAuthClient();

export const { useSession, signIn, signUp, signOut } = authClient;
