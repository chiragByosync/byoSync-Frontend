/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_JWKS_URL?: string; // e.g. https://trust.byosync.in/.well-known/jwks.json
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
