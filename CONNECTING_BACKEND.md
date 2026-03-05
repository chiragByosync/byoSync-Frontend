# Connecting the frontend to your backend

## 1. Create `.env`

```bash
cp .env.example .env
```

Edit `.env` and set at least `VITE_API_BASE` (see below).

---

## 2. Choose how the frontend reaches the backend

### Option A — Backend on same machine (e.g. `http://localhost:8000`)

- In **`.env`** set:
  ```env
  VITE_API_BASE=/api/v1
  ```
- In **`vite.config.ts`** the proxy is already set: requests to `/api` are forwarded to `http://localhost:8000`.
- Start your backend so it listens on port **8000** and serves:
  - `POST /api/v1/identity/create`
  - `GET /api/v1/identity/:uuid`
  - `GET /api/v1/identity/:uuid/status`
  - etc. (see list below)
- Start the frontend: `npm run dev` → open **http://localhost:3000**.  
  The app will call `http://localhost:3000/api/v1/...`, and Vite will proxy those to `http://localhost:8000/api/v1/...`.

**If your backend uses a different port** (e.g. 5000), change the proxy in `vite.config.ts`:

```ts
proxy: {
  '/api': {
    target: 'http://localhost:5000',  // your backend port
    changeOrigin: true,
  },
  '/.well-known': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
},
```

### Option B — Backend on another host (e.g. production API)

- In **`.env`** set the **full API base URL** (no trailing slash):
  ```env
  VITE_API_BASE=https://api.byosync.in/api/v1
  ```
- Your backend must **allow CORS** from the frontend origin (e.g. `https://app.byosync.in` or `http://localhost:3000`).  
  Typical: `Access-Control-Allow-Origin: <frontend-origin>`, and allow `Authorization`, `Content-Type`, `X-API-Key` if you use them.

---

## 3. Authentication (optional but needed for most APIs)

The frontend sends:

- **`X-API-Key`** — from env `VITE_API_KEY` (often used for identity create).
- **`Authorization: Bearer <token>`** — from `localStorage.getItem('byosync_jwt')`.

**To use JWT-protected endpoints** (identity read, consent, auth challenge, etc.):

1. Implement your login / auth flow.
2. After the user authenticates, store the JWT in `localStorage`:
   ```js
   localStorage.setItem('byosync_jwt', tokenFromBackend);
   ```
3. The axios client in `src/lib/api.ts` already reads `byosync_jwt` and adds `Authorization: Bearer <token>` to every request.

**For local testing without a real login**, you can set the JWT manually in the browser console:

```js
localStorage.setItem('byosync_jwt', 'your-test-jwt-here');
```

Then reload the app.

---

## 4. API endpoints the frontend calls

| Area        | Method | Path |
|------------|--------|------|
| Identity   | POST   | `/api/v1/identity/create` |
| Identity   | GET    | `/api/v1/identity/:uuid` |
| Identity   | GET    | `/api/v1/identity/:uuid/status` |
| Identity   | POST   | `/api/v1/identity/:uuid/suspend` |
| Identity   | POST   | `/api/v1/identity/:uuid/reactivate` |
| Identity   | POST   | `/api/v1/identity/:uuid/revoke` |
| Identity   | GET    | `/api/v1/identity/:uuid/history` |
| Identity   | GET    | `/api/v1/identity/:uuid/keys` |
| Identity   | POST   | `/api/v1/identity/:uuid/keys/rotate` |
| Auth       | POST   | `/api/v1/auth/challenge` |
| Auth       | POST   | `/api/v1/auth/verify` |
| Consent    | POST   | `/api/v1/consent/create` |
| Consent    | GET    | `/api/v1/consent/:consent_id` |
| Consent    | GET    | `/api/v1/consent/identity/:uuid/active` |
| JWKS       | GET    | `/.well-known/jwks.json` (proxied in dev) |

Your backend should implement these paths (and request/response shapes as in the spec). The frontend does **not** use a version prefix other than what you put in `VITE_API_BASE` (e.g. `/api/v1`).

---

## 5. Checklist

- [ ] `.env` created from `.env.example`
- [ ] `VITE_API_BASE` set (`/api/v1` for dev proxy, or full URL for remote backend)
- [ ] Backend running and reachable (same port as in `vite.config.ts` proxy if using Option A)
- [ ] If backend needs API key: set `VITE_API_KEY` in `.env`
- [ ] If you use JWT-protected endpoints: set `byosync_jwt` in localStorage (via your auth flow or manually for testing)
- [ ] If frontend and backend are on different origins: CORS enabled on the backend

After that, use the app at **http://localhost:3000** (or your deployed URL); it will talk to the backend using the config above.
