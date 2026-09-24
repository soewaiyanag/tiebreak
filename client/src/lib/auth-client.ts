import { createAuthClient } from "@neondatabase/neon-js/auth";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

/**
 * Neon Auth is a *hosted* service — the browser talks to it directly at
 * NEON_AUTH_BASE_URL, not through this app's own Express server (which only
 * verifies the resulting JWT — see server/src/middleware/auth.middleware.ts).
 * That's why this points at an absolute Neon URL instead of a same-origin
 * "/api/auth" path. Pattern: https://neon.com/guides/react-neon-auth-hono.
 *
 * `credentials: "include"` is needed because the auth service is
 * cross-origin from this app — without it, the browser won't send Neon
 * Auth's session cookie back to itself on the `/token` call below.
 *
 * `BetterAuthReactAdapter` gives the plain Better Auth client API
 * (signIn.email, signUp.email, signOut, useSession) plus React hooks — same
 * shape as importing straight from `better-auth/react`, just pointed at
 * Neon's managed instance instead of a self-hosted one.
 */
export const authClient = createAuthClient(import.meta.env.NEON_AUTH_BASE_URL, {
  adapter: BetterAuthReactAdapter({ fetchOptions: { credentials: "include" } }),
});

export const { useSession, signIn, signUp, signOut } = authClient;

/**
 * The short-lived (15 min) bearer token this app's own API expects in
 * `Authorization: Bearer <token>` — see lib/api/remote.ts, which calls this
 * on every request to a creator-only route. Returns null when signed out or
 * in guest mode; callers should treat that as "send no auth header" rather
 * than an error.
 */
export async function getBearerToken(): Promise<string | null> {
  try {
    const { data } = await authClient.token();
    return data?.token ?? null;
  } catch {
    // A public voter with no session hits this on every request — never let
    // it block the actual API call, just send no auth header.
    return null;
  }
}
