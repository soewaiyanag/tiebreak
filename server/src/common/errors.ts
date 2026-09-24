/**
 * A typed error services throw and app.ts's error-handling middleware turns
 * into the right HTTP response — the same job a Nest exception filter does,
 * without needing a framework to get it. Controllers never build error
 * responses themselves; they just let a service's throw propagate (Express 5
 * forwards a rejected promise from an async handler to error middleware
 * automatically, no try/catch boilerplate needed per route).
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }

  static badRequest(message: string): HttpError {
    return new HttpError(400, message);
  }

  static unauthorized(message: string): HttpError {
    return new HttpError(401, message);
  }

  static forbidden(message: string): HttpError {
    return new HttpError(403, message);
  }

  static notFound(message: string): HttpError {
    return new HttpError(404, message);
  }

  static conflict(message: string): HttpError {
    return new HttpError(409, message);
  }
}
