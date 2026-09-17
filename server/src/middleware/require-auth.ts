import type { NextFunction, Request, Response } from "express";

/**
 * Guards every route in routes/polls.ts — mount it in app.ts:
 *   app.use("/api/polls", requireAuth, pollsRouter);
 *
 * Frontend: nothing calls this directly, but it's what makes
 * client/src/components/layout/RequireAuth.tsx's redirect-to-login
 * meaningful — right now that component just checks whether the Better Auth
 * client has a session; this middleware is the server actually enforcing it.
 * routes/public.ts's routes (the vote page, results, casting a vote) must
 * stay reachable with **no** auth — never add this middleware there
 * (spec/technical-requirements.md: "vote and results pages are public by
 * link").
 *
 * Concept: JWKS verification. Better Auth issues a session; this middleware
 * verifies it against `NEON_AUTH_JWKS_URL` on every request (don't just trust
 * a client-sent user id) and attaches the verified user to `req.user`, so
 * every handler downstream can use `req.user.id` as the creator id without
 * re-checking auth itself.
 */
export async function requireAuth(_req: Request, res: Response, _next: NextFunction) {
  // TODO(you): verify the session/JWT (Better Auth's Express helper, or a
  // manual JWKS check against NEON_AUTH_JWKS_URL), attach the user to
  // req.user, call next(). On failure: res.status(401).json({ message: ... })
  //
  // Gotcha: `req.user` isn't a property Express's own Request type knows
  // about — you'll need a module augmentation somewhere (this file is a
  // reasonable place) along the lines of:
  //   declare global {
  //     namespace Express {
  //       interface Request { user?: { id: string; name: string; email: string } }
  //     }
  //   }
  // before `req.user = ...` (here) or `req.user.id` (in routes/polls.ts) will typecheck.
  res.status(501).json({ message: "not implemented" });
}
