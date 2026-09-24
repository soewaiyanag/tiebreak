import type { Request, Response } from "express";
import type { CreatePollInput, ReopenPollInput } from "@tiebreak/shared";
import { PollsService } from "../services/polls.service.js";
import { HttpError } from "../common/errors.js";

/** Request/response glue for the creator's own routes — every method assumes AuthMiddleware.verify already attached req.user. All business logic lives in PollsService. */
export class PollsController {
  private static requireUserId(req: Request): string {
    const userId = req.user?.id;
    if (!userId) throw HttpError.unauthorized("Sign in to do that.");
    return userId;
  }

  static async create(req: Request<Record<string, never>, unknown, CreatePollInput>, res: Response) {
    const poll = await PollsService.create(PollsController.requireUserId(req), req.body);
    res.status(201).json(poll);
  }

  static async list(req: Request, res: Response) {
    res.json(await PollsService.list(PollsController.requireUserId(req)));
  }

  static async getOne(req: Request<{ id: string }>, res: Response) {
    res.json(await PollsService.getById(PollsController.requireUserId(req), req.params.id));
  }

  static async settle(req: Request<{ id: string }>, res: Response) {
    res.json(await PollsService.settle(PollsController.requireUserId(req), req.params.id));
  }

  static async reopen(req: Request<{ id: string }, unknown, ReopenPollInput>, res: Response) {
    res.json(await PollsService.reopen(PollsController.requireUserId(req), req.params.id, req.body));
  }

  static async approveSuggestion(req: Request<{ id: string; optionId: string }>, res: Response) {
    const userId = PollsController.requireUserId(req);
    res.json(await PollsService.approveSuggestion(userId, req.params.id, req.params.optionId));
  }

  static async declineSuggestion(req: Request<{ id: string; optionId: string }>, res: Response) {
    const userId = PollsController.requireUserId(req);
    await PollsService.declineSuggestion(userId, req.params.id, req.params.optionId);
    res.status(204).end();
  }

  static async restoreSuggestion(req: Request<{ id: string; optionId: string }>, res: Response) {
    const userId = PollsController.requireUserId(req);
    res.json(await PollsService.restoreSuggestion(userId, req.params.id, req.params.optionId));
  }
}
