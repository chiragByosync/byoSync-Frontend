/**
 * API client using axios. Base URL from env; ready for backend connection.
 * Vite proxy in dev: /api -> http://localhost:8000
 *
 * Story 2.3: Assertion token (from verify) is NOT sent here. It is stored in memory
 * via TokenService. For calls to verifier backends, use TokenService.getAssertionAuthHeader()
 * and attach to the verifier request (Authorization: Bearer <assertion_token>).
 *
 * Story 4.2: On 403 with consent enforcement codes, redirect to /consent/required and store payload.
 */
import axios, { type AxiosError } from 'axios';
import { isConsentErrorResponse, storeConsentError, redirectToConsentRequired } from './consentError';
import type { ConsentErrorCode } from '../types/consent';

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

api.interceptors.response.use(
  (response) => {
    if (response.status === 403 && isConsentErrorResponse(response.data)) {
      const data = response.data;
      const code = data.code as ConsentErrorCode;
      storeConsentError({
        code,
        message: typeof data.message === 'string' ? data.message : undefined,
        requested_scope: Array.isArray(data.requested_scope) ? data.requested_scope : undefined,
        approved_scope: Array.isArray(data.approved_scope) ? data.approved_scope : undefined,
        verifier_id: typeof data.verifier_id === 'string' ? data.verifier_id : undefined,
        identity_uuid: typeof data.identity_uuid === 'string' ? data.identity_uuid : undefined,
        purpose: typeof data.purpose === 'string' ? data.purpose : undefined,
      });
      redirectToConsentRequired(code);
      const msg = typeof data.message === 'string' ? data.message : 'Consent required';
      return Promise.reject(new Error(msg));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

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
