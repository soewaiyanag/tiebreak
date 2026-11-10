import request from "supertest";
import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { db } from "../src/db/client.js";
import { options, polls, votes } from "../src/db/schema.js";

// Seatbelt: these tests insert rows. They must only ever see the Testcontainers database.
if (!process.env.DATABASE_URL || /neon\.tech/.test(process.env.DATABASE_URL)) {
  throw new Error("DATABASE_URL isn't the test container; refusing to run against a real database.");
}

const HOUR = 3_600_000;

/** A poll straight in the DB (creating one over HTTP needs a Neon Auth JWT): 2 creator options + 1 pending + 1 declined suggestion. */
async function seedPoll(overrides: Partial<typeof polls.$inferInsert> = {}) {
  const [poll] = await db
    .insert(polls)
    .values({
      slug: `test-${crypto.randomUUID()}`,
      creatorId: "test-creator",
      title: "Pizza night",
      closesAt: new Date(Date.now() + HOUR),
      ...overrides,
    })
    .returning();

  const [margherita, pepperoni, pending, declined] = await db
    .insert(options)
    .values([
      { pollId: poll.id, label: "Margherita", displayOrder: 0, source: "creator" },
      { pollId: poll.id, label: "Pepperoni", displayOrder: 1, source: "creator" },
      { pollId: poll.id, label: "Pineapple", displayOrder: 2, source: "suggestion", suggestionStatus: "pending" },
      { pollId: poll.id, label: "Anchovy", displayOrder: 3, source: "suggestion", suggestionStatus: "declined" },
    ])
    .returning();

  return { poll, margherita, pepperoni, pending, declined };
}

function castVote(slug: string, voterToken: string, optionIds: string[]) {
  return request(app)
    .post(`/api/p/${slug}/votes`)
    .send({ voterName: "Ana", voterAvatar: { seed: "Ana", tint: "f8c9b9" }, voterToken, optionIds });
}

function rowsFor(pollId: string, voterToken?: string) {
  const byPoll = eq(votes.pollId, pollId);
  return db
    .select()
    .from(votes)
    .where(voterToken ? and(byPoll, eq(votes.voterToken, voterToken)) : byPoll);
}

describe("POST /api/p/:slug/votes", () => {
  it("records a vote and returns the live results", async () => {
    const { poll, margherita } = await seedPoll();

    const res = await castVote(poll.slug, "browser-1", [margherita.id]);

    expect(res.status).toBe(200);
    expect(res.body.alreadyVoted).toBe(false);
    expect(res.body.results.totalVotes).toBe(1);
    expect(await rowsFor(poll.id)).toHaveLength(1);
  });

  it("treats a second vote from the same browser as a no-op", async () => {
    const { poll, margherita, pepperoni } = await seedPoll();
    await castVote(poll.slug, "browser-1", [margherita.id]);

    const res = await castVote(poll.slug, "browser-1", [pepperoni.id]);

    expect(res.status).toBe(200);
    expect(res.body.alreadyVoted).toBe(true);
    expect(await rowsFor(poll.id)).toHaveLength(1);
  });

  it("rejects a vote once the closing time has passed (409)", async () => {
    const { poll, margherita } = await seedPoll({ closesAt: new Date(Date.now() - HOUR) });

    const res = await castVote(poll.slug, "browser-1", [margherita.id]);

    expect(res.status).toBe(409);
    expect(await rowsFor(poll.id)).toHaveLength(0);
  });

  it("rejects more picks than a single-choice poll allows (400)", async () => {
    const { poll, margherita, pepperoni } = await seedPoll();

    const res = await castVote(poll.slug, "browser-1", [margherita.id, pepperoni.id]);

    expect(res.status).toBe(400);
  });

  it("rejects a malformed body before reaching the service (400)", async () => {
    const { poll } = await seedPoll();

    const res = await request(app).post(`/api/p/${poll.slug}/votes`).send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/^voterName:/);
  });

  it("counts every voter when 20 different browsers vote at once", async () => {
    const { poll, margherita, pepperoni } = await seedPoll();

    const responses = await Promise.all(
      Array.from({ length: 20 }, (_, i) => castVote(poll.slug, `browser-${i}`, [i % 2 ? margherita.id : pepperoni.id])),
    );

    expect(responses.map((r) => r.status)).toEqual(Array(20).fill(200));
    expect(await rowsFor(poll.id)).toHaveLength(20);
  });
});

/**
 * Known bugs in today's castVote, pinned as `it.fails` so the suite stays
 * green while still proving they exist. Step 3 (race-safe voting) flips each
 * of these to a plain `it`.
 */
describe("castVote known bugs (fixed in step 3)", () => {
  it.fails("a double-tap (parallel requests, same browser) records exactly one ballot", async () => {
    const { poll, margherita, pepperoni } = await seedPoll();
    // Warm the pool first: opening cold connections staggers the requests by a few ms, enough to hide the race.
    await Promise.all(Array.from({ length: 10 }, () => request(app).get(`/api/p/${poll.slug}/results`)));

    // Check-then-insert with no lock: every request passes "has this browser voted?" before any insert lands.
    // Observed today: 2 ballot rows for one browser (one per option) plus several unique-constraint 500s.
    const responses = await Promise.all(
      Array.from({ length: 10 }, (_, i) => castVote(poll.slug, "browser-1", [i % 2 ? margherita.id : pepperoni.id])),
    );

    expect(responses.map((r) => r.status)).toEqual(Array(10).fill(200));
    expect(await rowsFor(poll.id, "browser-1")).toHaveLength(1);
  });

  for (const target of ["pending suggestion", "declined suggestion", "another poll's option"] as const) {
    it.fails(`rejects a vote for a ${target} (400)`, async () => {
      const { poll, pending, declined } = await seedPoll();
      const other = await seedPoll();
      const optionId = { "pending suggestion": pending.id, "declined suggestion": declined.id, "another poll's option": other.margherita.id }[target];

      const res = await castVote(poll.slug, "browser-1", [optionId]);

      expect(res.status).toBe(400);
      expect(await rowsFor(poll.id)).toHaveLength(0);
    });
  }
});
