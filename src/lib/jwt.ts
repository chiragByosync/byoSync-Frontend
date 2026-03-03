import type { AssertionTokenPayload } from '../types/auth';

/**
 * Decode JWT payload without verification (client-side display only).
 * Story 2.3 — Assertion token payload structure.
 */
export function decodeJwtPayload(token: string): AssertionTokenPayload | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as AssertionTokenPayload;
  } catch {
    return null;
  }
}

export function formatJwtTimestamp(sec?: number): string {
  if (sec == null) return '—';
  try {
    return new Date(sec * 1000).toISOString();
  } catch {
    return String(sec);
  }
}
