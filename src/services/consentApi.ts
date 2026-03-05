import { api } from '../lib/api';
import type {
  ConsentCreateRequest,
  ConsentCreateResponse,
  ConsentDetailResponse,
  ConsentListResponse,
  ConsentRevokeRequest,
} from '../types/consent';

/** Create a new consent record — requires JWT (identity holder) with consent:write */
export async function createConsent(
  body: ConsentCreateRequest
): Promise<ConsentCreateResponse> {
  const res = await api.post<ConsentCreateResponse>('/consent/create', body);
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Request failed: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.data;
}

/** Get consent details — requires JWT with consent:read */
export async function getConsent(
  consentId: string
): Promise<ConsentDetailResponse> {
  const encoded = encodeURIComponent(consentId);
  const res = await api.get<ConsentDetailResponse>(`/consent/${encoded}`);
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Request failed: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.data;
}

/** List all active consents for an identity — requires JWT with consent:read */
export async function listActiveConsents(
  identityUuid: string
): Promise<ConsentListResponse> {
  const encoded = encodeURIComponent(identityUuid);
  const res = await api.get<ConsentListResponse>(
    `/consent/identity/${encoded}/active`
  );
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Request failed: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.data;
}

/** Story 4.3 — Revoke a single consent. JWT (identity holder or admin) with consent:revoke */
export async function revokeConsent(
  consentId: string,
  body?: ConsentRevokeRequest
): Promise<void> {
  const encoded = encodeURIComponent(consentId);
  const res = await api.post(`/consent/${encoded}/revoke`, body ?? {});
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Revoke failed: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
}

/** Story 4.3 — Revoke all consents for an identity. JWT (identity holder or admin) with consent:revoke */
export async function revokeAllConsents(
  identityUuid: string,
  body?: ConsentRevokeRequest
): Promise<void> {
  const encoded = encodeURIComponent(identityUuid);
  const res = await api.post(`/consent/identity/${encoded}/revoke-all`, body ?? {});
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Revoke all failed: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
}
