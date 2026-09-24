/**
 * Verifies the four flows that actually matter end-to-end, against the real
 * deployed API and the real Neon Auth service — no browser, no mocks:
 * login, poll creation, voting, and results reflecting the vote.
 *
 * Run: yarn workspace @tiebreak/server test:smoke
 * Needs SMOKE_TEST_EMAIL / SMOKE_TEST_PASSWORD in the root .env.local — any
 * throwaway Neon Auth account works, it's created automatically on first run.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name} — set it in .env.local (see .env.example).`);
    process.exit(1);
  }
  return value;
}

const authBase = requireEnv("NEON_AUTH_BASE_URL");
const apiBase = process.env.SMOKE_TEST_API_BASE ?? "https://tiebreak-soewaiyanag.vercel.app/api";
const email = requireEnv("SMOKE_TEST_EMAIL");
const password = requireEnv("SMOKE_TEST_PASSWORD");

/**
 * Neon Auth is a shared hosted service — it uses the Origin header to know
 * which app's trusted-domain list applies, and rejects requests without one
 * (a check that lives in Neon's hosted layer, not in the bundled `better-auth`
 * source). This must be a domain already registered via
 * `neon neon-auth domain add` — see CLIENT_ORIGIN in .env.local.
 */
const trustedOrigin = requireEnv("CLIENT_ORIGIN");

function log(step: string) {
  console.log(`-> ${step}`);
}

/** Node's fetch has no cookie jar — forward Set-Cookie back as a Cookie header ourselves. */
function cookieHeaderFrom(res: Response): string {
  const cookies = res.headers.getSetCookie?.() ?? [];
  return cookies.map((c) => c.split(";")[0]).join("; ");
}

async function signIn(): Promise<string> {
  let res = await fetch(`${authBase}/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: trustedOrigin },
    body: JSON.stringify({ email, password }),
  });

  if (res.status === 401) {
    log("No existing account for this email — signing up instead");
    res = await fetch(`${authBase}/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: trustedOrigin },
      body: JSON.stringify({ name: "Smoke Test", email, password }),
    });
  }

  if (!res.ok) throw new Error(`Auth failed (${res.status}): ${await res.text()}`);
  return cookieHeaderFrom(res);
}

async function mintBearerToken(cookie: string): Promise<string> {
  const res = await fetch(`${authBase}/token`, { headers: { Cookie: cookie, Origin: trustedOrigin } });
  if (!res.ok) throw new Error(`Minting a bearer token failed (${res.status}): ${await res.text()}`);
  const { token } = (await res.json()) as { token?: string };
  if (!token) throw new Error("Token endpoint responded without a token");
  return token;
}

async function main() {
  log(`Signing in to Neon Auth as ${email}`);
  const cookie = await signIn();

  log("Minting a bearer JWT (proves the login is real, not just a cookie)");
  const token = await mintBearerToken(cookie);
  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  log("Creating a poll — POST /api/polls");
  const closesAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const createRes = await fetch(`${apiBase}/polls`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: `Smoke test ${new Date().toISOString()}`,
      type: "single",
      maxChoices: 1,
      suggestionsEnabled: false,
      closesAt,
      options: ["Option A", "Option B"],
    }),
  });
  if (!createRes.ok) throw new Error(`Poll creation failed (${createRes.status}): ${await createRes.text()}`);
  const poll = (await createRes.json()) as { id: string; slug: string };
  log(`Poll created: ${poll.slug}`);

  log("Fetching poll detail for option ids — GET /api/polls/:id (proves the login owns it)");
  const detailRes = await fetch(`${apiBase}/polls/${poll.id}`, { headers: authHeaders });
  if (!detailRes.ok) throw new Error(`Poll detail fetch failed (${detailRes.status}): ${await detailRes.text()}`);
  const detail = (await detailRes.json()) as { options: { id: string }[] };
  const optionId = detail.options[0]?.id;
  if (!optionId) throw new Error("Created poll has no options");

  log("Casting a vote — POST /api/p/:slug/votes (public, no auth)");
  const voteRes = await fetch(`${apiBase}/p/${poll.slug}/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      voterName: "Smoke Tester",
      voterAvatar: { seed: "smoke-test", tint: "f8c9b9" },
      voterToken: `smoke-${Date.now()}`,
      optionIds: [optionId],
    }),
  });
  if (!voteRes.ok) throw new Error(`Vote failed (${voteRes.status}): ${await voteRes.text()}`);

  log("Checking results reflect the vote — GET /api/p/:slug/results");
  const resultsRes = await fetch(`${apiBase}/p/${poll.slug}/results`);
  if (!resultsRes.ok) throw new Error(`Results fetch failed (${resultsRes.status}): ${await resultsRes.text()}`);
  const results = (await resultsRes.json()) as {
    totalVotes: number;
    tallies: { optionId: string; votes: number }[];
  };
  const tally = results.tallies.find((t) => t.optionId === optionId);
  if (results.totalVotes !== 1 || tally?.votes !== 1) {
    throw new Error(`Results didn't reflect the vote: ${JSON.stringify(results)}`);
  }

  console.log("\nAll four flows verified: login, poll creation, voting, live results.");
  console.log(`Poll: ${apiBase.replace(/\/api$/, "")}/p/${poll.slug}`);
}

main().catch((err) => {
  console.error("\nSMOKE TEST FAILED\n", err instanceof Error ? err.message : err);
  process.exit(1);
});
