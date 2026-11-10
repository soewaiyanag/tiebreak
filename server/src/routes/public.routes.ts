import { Router } from "express";
import { PublicController } from "../controllers/public.controller.js";
import { Validate } from "../middleware/validate.middleware.js";
import { castVoteSchema, suggestOptionSchema } from "../common/schemas.js";

/** No auth anywhere here — reachable by anyone with the link (spec/technical-requirements.md). */
export const publicRouter = Router();

publicRouter.get("/:slug", PublicController.getPoll);
publicRouter.get("/:slug/results", PublicController.getResults);
publicRouter.get("/:slug/stream", PublicController.stream);
publicRouter.post("/:slug/votes", Validate.body(castVoteSchema), PublicController.castVote);
publicRouter.post("/:slug/suggestions", Validate.body(suggestOptionSchema), PublicController.suggestOption);
