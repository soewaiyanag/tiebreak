import { createAuthClient } from "better-auth/react";

/**
 * Better Auth's client SDK (TODO.md Phase 2: "client Better Auth SDK for sign
 * in/up/out"). Sign-in/up/out calls here will fail with a network error until
 * the server mounts the Better Auth handler and verifies sessions against
 * Neon Auth — that's the user's backend TODO, not this file's.
 */
export const authClient = createAuthClient({
  baseURL: "/api/auth",
});

export const { useSession, signIn, signUp, signOut } = authClient;
