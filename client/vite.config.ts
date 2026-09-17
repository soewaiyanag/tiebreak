import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api/* to the Hono server so local dev is same-origin (no CORS).
    // Production uses real CORS on the deployed server instead.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
