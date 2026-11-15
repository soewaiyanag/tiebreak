/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Neon Auth's hosted base URL — see vite.config.ts's envPrefix for why this reaches the client. */
  readonly NEON_AUTH_BASE_URL: string;
  /** "remote" talks to a real API; anything else runs on the in-browser demo store (lib/api-mode.ts). */
  readonly VITE_API_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
