/**
 * Story 4.2 — Consent enforcement: detect 403 consent errors and store payload for ConsentRequired page.
 */

import type { ConsentErrorCode, ConsentErrorPayload } from '../types/consent';

const STORAGE_KEY = 'byosync_consent_error';

export function isConsentErrorResponse(data: unknown): data is { code: ConsentErrorCode; [key: string]: unknown } {
  if (!data || typeof data !== 'object' || !('code' in data)) return false;
  const code = (data as { code: string }).code;
  return [
    'CONSENT_REQUIRED',
    'CONSENT_EXPIRED',
    'CONSENT_REVOKED',
    'SCOPE_EXCEEDED',
    'CONSENT_LOCATION_REQUIRED',
    'CONSENT_SESSION_REQUIRED',
  ].includes(code);
}

export function storeConsentError(payload: ConsentErrorPayload): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function getAndClearConsentError(): ConsentErrorPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentErrorPayload;
  } catch {
    return null;
  }
}

export function redirectToConsentRequired(code: ConsentErrorCode): void {
  if (typeof window === 'undefined') return;
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '') || '';
  const path = `${base}/consent/required?code=${encodeURIComponent(code)}`;
  window.location.href = window.location.origin + path;
}
