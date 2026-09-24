import { Router } from "express";
import { PollsController } from "../controllers/polls.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

/** Creator-only — every route here runs AuthMiddleware.verify first. */
export const pollsRouter = Router();

pollsRouter.use(AuthMiddleware.verify);

pollsRouter.post("/", PollsController.create);
pollsRouter.get("/", PollsController.list);
pollsRouter.get("/:id", PollsController.getOne);
pollsRouter.post("/:id/settle", PollsController.settle);
pollsRouter.post("/:id/reopen", PollsController.reopen);
pollsRouter.post("/:id/suggestions/:optionId/approve", PollsController.approveSuggestion);
pollsRouter.post("/:id/suggestions/:optionId/decline", PollsController.declineSuggestion);
pollsRouter.post("/:id/suggestions/:optionId/restore", PollsController.restoreSuggestion);
