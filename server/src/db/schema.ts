import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const pollTypeEnum = pgEnum("poll_type", ["single", "multi"]);
export const pollStatusEnum = pgEnum("poll_status", ["open", "settled"]);
export const optionSourceEnum = pgEnum("option_source", ["creator", "suggestion"]);
export const suggestionStatusEnum = pgEnum("suggestion_status", ["pending", "approved", "declined"]);

export const polls = pgTable("polls", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(), // the public /p/:slug — this IS the access control
  creatorId: text("creator_id").notNull(), // Neon Auth user id; real FK once Phase 2 wires auth

  title: text("title").notNull(),
  maxChoices: integer("max_choices").notNull().default(1),
  suggestionsEnabled: boolean("suggestions_enabled").notNull().default(true),

  closesAt: timestamp("closes_at", { withTimezone: true }).notNull(),
  settledAt: timestamp("settled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

  type: pollTypeEnum("type").notNull().default("single"),
  status: pollStatusEnum("status").notNull().default("open"),

  // Nullable self-reference — set only on a tiebreak round's child poll.
  parentPollId: uuid("parent_poll_id").references((): AnyPgColumn => polls.id),
});

export const options = pgTable("options", {
  id: uuid("id").defaultRandom().primaryKey(),
  pollId: uuid("poll_id")
    .notNull()
    .references((): AnyPgColumn => polls.id, { onDelete: "cascade" }),

  label: text("label").notNull(),
  displayOrder: integer("display_order").notNull().default(0),

  // Null for creator options. Set as a suggestion moves pending -> approved /
  // declined. An approved suggestion is just an option with
  // suggestionStatus = "approved" and zero rows in `votes` yet.
  suggestedByName: text("suggested_by_name"),
  suggestedBySeed: text("suggested_by_seed"),
  suggestedByTint: text("suggested_by_tint"),

  source: optionSourceEnum("source").notNull(),
  suggestionStatus: suggestionStatusEnum("suggestion_status"),
});

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pollId: uuid("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    optionId: uuid("option_id")
      .notNull()
      .references(() => options.id, { onDelete: "cascade" }),

    voterName: text("voter_name").notNull(),
    voterSeed: text("voter_seed").notNull(),
    voterTint: text("voter_tint").notNull(),
    voterToken: text("voter_token").notNull(),

    castAt: timestamp("cast_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One vote per (poll, browser) — enforced by Postgres, not just app code.
    unique("votes_poll_voter_unique").on(table.pollId, table.voterToken),
  ],
);
