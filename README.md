# ByoSync — Identity Registry Frontend

React + TypeScript + Tailwind frontend for the **ByoSync Identity Registry Service** (Part 1.1). Built to connect to your backend with minimal configuration.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Connect to your backend

1. **Development (proxy)**  
   `vite.config.ts` proxies `/api` to `http://localhost:8000`. Start your backend on port 8000, or change `server.proxy['/api'].target`.

2. **Env (optional)**  
   Copy `.env.example` to `.env` and set:
   - `VITE_API_BASE` — e.g. `https://api.byosync.com/api/v1` (no trailing slash)
   - `VITE_API_KEY` — API key for `identity:write` (create)

3. **JWT for read endpoints**  
   `GET /api/v1/identity/:uuid` and `GET /api/v1/identity/:uuid/status` expect a JWT. The app sends `Authorization: Bearer <token>` when `localStorage.byosync_jwt` is set. Your auth flow should set that after login.

## Features (Part 1.1)

- **Create Identity** — Form for `POST /api/v1/identity/create` with validation (Base64 key, SHA-256 hashes, UUIDs, ISO date, KYC/sector enums). Duplicate phone hash (409) handled.
- **Look up Identity** — Enter UUID, then view metadata or status.
- **View Identity** — Displays response of `GET /api/v1/identity/:uuid`.
- **View Status** — Displays response of `GET /api/v1/identity/:uuid/status`.

## Tech stack

- React 19, TypeScript, Vite 7
- Tailwind CSS 4
- React Router 7
- White–blue ByoSync theme; layout and forms are responsive and error-safe (ErrorBoundary, validation, API error handling).

## Build

```bash
npm run build
npm run preview   # preview production build
```
