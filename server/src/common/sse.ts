import type { Response } from "express";

/**
 * A per-slug subscriber set for live results (differentiator #1). The
 * client already tries `EventSource` first and silently falls back to
 * polling if this 404s or errors (client/src/lib/api/remote.ts), so this is
 * a pure upgrade — nothing else changes if it's ever removed.
 *
 * In-memory only, via static state on the class (there's only ever one of
 * these — a lightweight singleton, no need to construct an instance). Fine
 * for a single Express process; if this ever runs as multiple instances
 * behind a load balancer, subscribers on one instance won't hear about a
 * vote written via another — would need a shared pub/sub (e.g. Postgres
 * LISTEN/NOTIFY, or Redis) at that point.
 */
export class SseHub {
  private static subscribers = new Map<string, Set<Response>>();
  private static readonly KEEP_ALIVE_MS = 25_000;

  /** Registers `res` as an SSE connection for `slug`. Returns the cleanup function to call on `req.on("close", ...)`. */
  static subscribe(slug: string, res: Response): () => void {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write(": connected\n\n");

    const forSlug = SseHub.subscribers.get(slug) ?? new Set();
    forSlug.add(res);
    SseHub.subscribers.set(slug, forSlug);

    const keepAlive = setInterval(() => res.write(": keep-alive\n\n"), SseHub.KEEP_ALIVE_MS);

    return () => {
      clearInterval(keepAlive);
      forSlug.delete(res);
      if (forSlug.size === 0) SseHub.subscribers.delete(slug);
    };
  }

  static publish(slug: string, data: unknown): void {
    const forSlug = SseHub.subscribers.get(slug);
    if (!forSlug) return;
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of forSlug) res.write(payload);
  }
}
