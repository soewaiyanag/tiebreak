import { Router } from "express";
import { PublicController } from "../controllers/public.controller.js";

/** No auth anywhere here — reachable by anyone with the link (spec/technical-requirements.md). */
export const publicRouter = Router();

publicRouter.get("/:slug", PublicController.getPoll);
publicRouter.get("/:slug/results", PublicController.getResults);
publicRouter.get("/:slug/stream", PublicController.stream);
publicRouter.post("/:slug/votes", PublicController.castVote);
publicRouter.post("/:slug/suggestions", PublicController.suggestOption);
