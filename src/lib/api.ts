/**
 * API client using axios. Base URL from env; ready for backend connection.
 * Vite proxy in dev: /api -> http://localhost:8000
 *
 * Story 2.3: Assertion token (from verify) is NOT sent here. It is stored in memory
 * via TokenService. For calls to verifier backends, use TokenService.getAssertionAuthHeader()
 * and attach to the verifier request (Authorization: Bearer <assertion_token>).
 */
import axios, { type AxiosError } from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true, // we handle errors manually
});

api.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_API_KEY;
  // Optional backend auth JWT (e.g. operator). Not the assertion_token from Story 2.3.
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('byosync_jwt') : null;
  if (apiKey) config.headers.set('X-API-Key', apiKey);
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

export function getApiError(err: unknown): { message: string; status?: number } {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ message?: string }>;
    const message =
      ax.response?.data?.message ??
      ax.message ??
      `Request failed${ax.response?.status ? `: ${ax.response.status}` : ''}`;
    return { message, status: ax.response?.status };
  }
  const message = err instanceof Error ? err.message : 'Request failed';
  return { message };
}

export { API_BASE };
