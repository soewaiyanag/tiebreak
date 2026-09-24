import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import morgan from "morgan";
import { pollsRouter } from "./routes/polls.routes.js";
import { publicRouter } from "./routes/public.routes.js";
import { HttpError } from "./common/errors.js";

/**
 * The Express app: all routing + middleware. `index.ts` is just the listener
 * (`app.listen`) — kept separate so `app` can be imported directly into tests
 * later without booting a real server.
 */
export const app = express();

/** Request logging — same idea as Hono's, just Express's usual choice. */
app.use(morgan("dev"));

/**
 * CORS: the browser blocks cross-origin calls from the client unless the
 * server opts in. In local dev the Vite proxy makes calls same-origin so this
 * rarely fires, but the deployed client (Vercel) and deployed server
 * (Railway) are on different origins, and this is what lets them talk.
 *
 * Docs: https://github.com/expressjs/cors#configuring-cors-w-dynamic-origin
 *
 * `origin` here is a function instead of a fixed string, called once per
 * request with two arguments:
 *   - `origin` (the 1st arg) — the value of the request's `Origin` header:
 *     a string like "http://localhost:5173", or undefined if the request
 *     carries no Origin header at all (curl, some same-origin cases).
 *   - `callback` (the 2nd arg) — call it exactly once with your decision:
 *     `callback(error, allow)`. This is Node's classic "error-first callback"
 *     convention (same shape as fs.readFile(path, (err, data) => {})) — it
 *     exists so the check can be async if it needs to be (the package's own
 *     docs example looks up allowed origins from a database first). We decide
 *     synchronously and call back right away.
 *   `allow: false` denies cleanly: no Access-Control-Allow-Origin header gets
 *   set, the browser blocks the response, and nothing throws.
 */
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.CLIENT_ORIGIN
    : "http://localhost:5173";

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header at all — curl, server-to-server calls, same-origin
      // requests. Nothing to check against; allow.
      if (!origin) return callback(null, true);
      if (allowedOrigin && origin === allowedOrigin) {
        return callback(null, true);
      }
      callback(null, false); // deny — nothing configured, or origin doesn't match
    },
    credentials: true,
  }),
);

// Parses JSON request bodies (poll creation, votes, ...) into req.body.
app.use(express.json());

/**
 * Liveness probe: is the process up and answering? Deliberately does not
 * touch the database — a DB check is a separate concern (/api/health/db).
 */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Neon Auth is a hosted service — the client talks to it directly
// (client/src/lib/auth-client.ts), never through this server. Nothing to
// mount here; auth.middleware.ts only verifies the JWT it issues.

// Public — no account, reachable by anyone with the link. See
// routes/public.routes.ts -> controllers/public.controller.ts ->
// services/public.service.ts for what each route does and which frontend
// page calls it.
app.use("/api/p", publicRouter);

// Creator-only — every route runs auth.middleware.ts's AuthMiddleware.verify
// first (mounted inside polls.routes.ts itself). See
// routes/polls.routes.ts -> controllers/polls.controller.ts ->
// services/polls.service.ts.
app.use("/api/polls", pollsRouter);

/**
 * Every service throws HttpError for an expected failure (not found, poll
 * closed, wrong owner, ...); Express 5 forwards a rejected promise from any
 * async handler or middleware straight here automatically — no per-route
 * try/catch needed. This is the same job a Nest exception filter does.
 */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ message: "That request body isn't valid JSON." });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong." });
};
app.use(errorHandler);

export default app;
