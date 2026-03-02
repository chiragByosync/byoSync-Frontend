import { api } from '../lib/api';
import type {
  IdentityCreateRequest,
  IdentityCreateResponse,
  IdentityMetadataResponse,
  IdentityStatusResponse,
  IdentitySuspendRequest,
  IdentityRevokeRequest,
  IdentityHistoryResponse,
  IdentityKeyRotateRequest,
  IdentityKeysResponse,
} from '../types/identity';

/** Create a new identity — requires API Key with identity:write */
export async function createIdentity(
  body: IdentityCreateRequest
): Promise<IdentityCreateResponse> {
  const res = await api.post<IdentityCreateResponse>('/identity/create', body);
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Request failed: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.data;
}

/** Fetch identity metadata — requires JWT with identity:read */
export async function getIdentity(
  uuid: string
): Promise<IdentityMetadataResponse> {
  const encoded = encodeURIComponent(uuid);
  const res = await api.get<IdentityMetadataResponse>(`/identity/${encoded}`);
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Request failed: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.data;
}

/** Get identity lifecycle status — requires JWT with identity:read */
export async function getIdentityStatus(
  uuid: string
): Promise<IdentityStatusResponse> {
  const encoded = encodeURIComponent(uuid);
  const res = await api.get<IdentityStatusResponse>(
    `/identity/${encoded}/status`
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

/** Story 1.2 — Suspend identity (JWT + Admin, identity:admin) */
export async function suspendIdentity(
  uuid: string,
  body: IdentitySuspendRequest
): Promise<IdentityStatusResponse> {
  const encoded = encodeURIComponent(uuid);
  const res = await api.post<IdentityStatusResponse>(
    `/identity/${encoded}/suspend`,
    body
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

/** Story 1.2 — Reactivate suspended identity (JWT + Admin, identity:admin) */
export async function reactivateIdentity(
  uuid: string
): Promise<IdentityStatusResponse> {
  const encoded = encodeURIComponent(uuid);
  const res = await api.post<IdentityStatusResponse>(
    `/identity/${encoded}/reactivate`,
    {}
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

/** Story 1.2 — Permanently revoke identity (JWT + Admin, identity:admin) */
export async function revokeIdentity(
  uuid: string,
  body: IdentityRevokeRequest
): Promise<IdentityStatusResponse> {
  const encoded = encodeURIComponent(uuid);
  const res = await api.post<IdentityStatusResponse>(
    `/identity/${encoded}/revoke`,
    body
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

/** Story 1.2 — Get full lifecycle event history (JWT, identity:read) */
export async function getIdentityHistory(
  uuid: string
): Promise<IdentityHistoryResponse> {
  const encoded = encodeURIComponent(uuid);
  const res = await api.get<IdentityHistoryResponse>(
    `/identity/${encoded}/history`
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

/** Story 1.3 — List all key versions (JWT, identity:read) */
export async function getIdentityKeys(
  uuid: string
): Promise<IdentityKeysResponse> {
  const encoded = encodeURIComponent(uuid);
  const res = await api.get<IdentityKeysResponse>(
    `/identity/${encoded}/keys`
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

/** Story 1.3 — Rotate public key (JWT identity holder, identity:write) */
export async function rotateIdentityKey(
  uuid: string,
  body: IdentityKeyRotateRequest
): Promise<IdentityKeysResponse> {
  const encoded = encodeURIComponent(uuid);
  const res = await api.post<IdentityKeysResponse>(
    `/identity/${encoded}/keys/rotate`,
    body
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
