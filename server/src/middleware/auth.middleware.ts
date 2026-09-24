import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { HttpError } from "../common/errors.js";

// Express's own Request type doesn't know about `user` — PollsController
// reads req.user.id as the creator id, attached below once the token verifies.
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
if (!jwksUrl) throw new Error("NEON_AUTH_JWKS_URL is not set");

// Fetched once and cached/refreshed internally by jose — not re-fetched per request.
const JWKS = createRemoteJWKSet(new URL(jwksUrl));

/**
 * Guards every route in routes/polls.routes.ts:
 *   router.use(AuthMiddleware.verify);
 *
 * Neon Auth is a *hosted* service (client/src/lib/auth-client.ts talks to it
 * directly, not through this server), so this server never issues sessions
 * itself — its only auth job is verifying the JWT a signed-in creator sends,
 * against Neon Auth's public JWKS endpoint. `payload.sub` is the stable
 * user id (see https://neon.com/guides/react-neon-auth-hono, the reference
 * pattern this follows).
 *
 * routes/public.routes.ts's routes (the vote page, results, casting a vote)
 * must stay reachable with **no** auth — never add this middleware there
 * (spec/technical-requirements.md: "vote and results pages are public by
 * link").
 */
export class AuthMiddleware {
  static async verify(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.header("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw HttpError.unauthorized("Sign in to do that.");
    }

    try {
      const { payload } = await jwtVerify(authHeader.slice("Bearer ".length), JWKS, {
        issuer: new URL(jwksUrl!).origin,
      });
      if (!payload.sub) throw HttpError.unauthorized("Invalid session. Sign in again.");
      req.user = { id: payload.sub };
      next();
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw HttpError.unauthorized("Invalid session. Sign in again.");
    }
  }
}
