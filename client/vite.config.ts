import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Read the same root .env.local the server does (one source of truth for
  // NEON_AUTH_BASE_URL) instead of requiring a separate client/.env file.
  envDir: "../",
  // Vite only exposes VITE_-prefixed vars to import.meta.env by default, to
  // stop server secrets leaking into the client bundle. NEON_AUTH_BASE_URL
  // is public on purpose — it's the URL the browser calls directly to sign
  // in — so it's allow-listed here rather than renamed.
  envPrefix: ["VITE_", "NEON_AUTH_"],
  server: {
    // Forward /api/* to the Express server so local dev is same-origin (no CORS).
    // Production uses real CORS on the deployed server instead.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
