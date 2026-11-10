import type { RequestHandler } from "express";
import type { z } from "zod";
import { HttpError } from "../common/errors.js";

/**
 * Parses req.body against a schema before the controller runs. On failure it
 * throws a 400 (Express forwards a sync throw to app.ts's error handler); on
 * success it swaps req.body for the parsed value, so controllers and services
 * only ever see trimmed, type-checked input.
 */
export class Validate {
  static body(schema: z.ZodType): RequestHandler {
    return (req, _res, next) => {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const [issue] = result.error.issues;
        const where = issue.path.length ? `${issue.path.join(".")}: ` : "";
        throw HttpError.badRequest(`${where}${issue.message}`);
      }
      req.body = result.data;
      next();
    };
  }
}
