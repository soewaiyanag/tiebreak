import type { Request, Response } from "express";
import type { CastVoteInput, SuggestOptionInput } from "@tiebreak/shared";
import { PublicService } from "../services/public.service.js";
import { SseHub } from "../common/sse.js";

/** Request/response glue for the no-account voter's routes — all business logic lives in PublicService. */
export class PublicController {
  static async getPoll(req: Request<{ slug: string }>, res: Response) {
    res.json(await PublicService.getPublicPoll(req.params.slug));
  }

  static async getResults(req: Request<{ slug: string }>, res: Response) {
    res.json(await PublicService.getResults(req.params.slug));
  }

  static async stream(req: Request<{ slug: string }>, res: Response) {
    await PublicService.requirePoll(req.params.slug); // 404s cleanly before upgrading the connection
    const unsubscribe = SseHub.subscribe(req.params.slug, res);
    req.on("close", unsubscribe);
  }

  static async castVote(req: Request<{ slug: string }, unknown, CastVoteInput>, res: Response) {
    const result = await PublicService.castVote(req.params.slug, req.body);
    if (!result.alreadyVoted) SseHub.publish(req.params.slug, result.results);
    res.json(result);
  }

  static async suggestOption(req: Request<{ slug: string }, unknown, SuggestOptionInput>, res: Response) {
    res.status(201).json(await PublicService.suggestOption(req.params.slug, req.body));
  }
}
