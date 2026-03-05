import { api } from '../lib/api';
import type {
  VerifierRegisterRequest,
  VerifierRegisterResponse,
  VerifierProfile,
  VerifierUpdateRequest,
  VerifierRotateKeyResponse,
  VerifierUsageResponse,
} from '../types/verifier';

/** POST /api/v1/verifier/register — Master API Key + verifier:admin */
export async function registerVerifier(
  body: VerifierRegisterRequest
): Promise<VerifierRegisterResponse> {
  const res = await api.post<VerifierRegisterResponse>('/verifier/register', body);
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Registration failed: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.data;
}

/** GET /api/v1/verifier/:id — JWT verifier:read */
export async function getVerifier(verifierId: string): Promise<VerifierProfile> {
  const encoded = encodeURIComponent(verifierId);
  const res = await api.get<VerifierProfile>(`/verifier/${encoded}`);
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Failed to load verifier: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.data;
}

/** PUT /api/v1/verifier/:id — JWT + Admin verifier:admin */
export async function updateVerifier(
  verifierId: string,
  body: VerifierUpdateRequest
): Promise<VerifierProfile> {
  const encoded = encodeURIComponent(verifierId);
  const res = await api.put<VerifierProfile>(`/verifier/${encoded}`, body);
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Update failed: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.data;
}

/** POST /api/v1/verifier/:id/api-key/rotate — JWT + Admin verifier:admin. New key shown ONCE. */
export async function rotateVerifierApiKey(
  verifierId: string
): Promise<VerifierRotateKeyResponse> {
  const encoded = encodeURIComponent(verifierId);
  const res = await api.post<VerifierRotateKeyResponse>(
    `/verifier/${encoded}/api-key/rotate`,
    {}
  );
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Key rotation failed: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.data;
}

/** GET /api/v1/verifier/:id/usage — JWT verifier:read */
export async function getVerifierUsage(
  verifierId: string
): Promise<VerifierUsageResponse> {
  const encoded = encodeURIComponent(verifierId);
  const res = await api.get<VerifierUsageResponse>(`/verifier/${encoded}/usage`);
  if (res.status >= 400) {
    const err = new Error(
      (res.data as { message?: string })?.message ?? `Failed to load usage: ${res.status}`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.data;
}
