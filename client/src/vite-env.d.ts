/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Neon Auth's hosted base URL — see vite.config.ts's envPrefix for why this reaches the client. */
  readonly NEON_AUTH_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
