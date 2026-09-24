CREATE TYPE "public"."option_source" AS ENUM('creator', 'suggestion');--> statement-breakpoint
CREATE TYPE "public"."poll_status" AS ENUM('open', 'settled');--> statement-breakpoint
CREATE TYPE "public"."poll_type" AS ENUM('single', 'multi');--> statement-breakpoint
CREATE TYPE "public"."suggestion_status" AS ENUM('pending', 'approved', 'declined');--> statement-breakpoint
CREATE TABLE "options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"label" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"suggested_by_name" text,
	"suggested_by_seed" text,
	"suggested_by_tint" text,
	"source" "option_source" NOT NULL,
	"suggestion_status" "suggestion_status"
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"creator_id" text NOT NULL,
	"title" text NOT NULL,
	"max_choices" integer DEFAULT 1 NOT NULL,
	"suggestions_enabled" boolean DEFAULT true NOT NULL,
	"closes_at" timestamp with time zone NOT NULL,
	"settled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"type" "poll_type" DEFAULT 'single' NOT NULL,
	"status" "poll_status" DEFAULT 'open' NOT NULL,
	"parent_poll_id" uuid,
	CONSTRAINT "polls_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"option_id" uuid NOT NULL,
	"voter_name" text NOT NULL,
	"voter_seed" text NOT NULL,
	"voter_tint" text NOT NULL,
	"voter_token" text NOT NULL,
	"cast_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "votes_poll_voter_option_unique" UNIQUE("poll_id","voter_token","option_id")
);
--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_parent_poll_id_polls_id_fk" FOREIGN KEY ("parent_poll_id") REFERENCES "public"."polls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_option_id_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."options"("id") ON DELETE cascade ON UPDATE no action;