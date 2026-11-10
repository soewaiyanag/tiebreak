CREATE INDEX "options_poll_id_idx" ON "options" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "polls_creator_id_idx" ON "polls" USING btree ("creator_id");