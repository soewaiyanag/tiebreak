import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Starts a throwaway Postgres 17 (Testcontainers), migrates it, and points DATABASE_URL at it.
    globalSetup: ["./test/global-setup.ts"],
    // auth.middleware.ts requires this at import; jose only fetches it on first use, and these tests never sign in.
    env: { NEON_AUTH_JWKS_URL: "https://auth.invalid/.well-known/jwks.json" },
  },
});
