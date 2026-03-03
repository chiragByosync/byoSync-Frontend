import { api } from '../lib/api';
import type {
  ChallengeRequest,
  ChallengeResponse,
  VerifyRequest,
  VerifyResponse,
  AuthErrorBody,
} from '../types/auth';

/**
 * Epic 2, Story 2.1 — Issue a cryptographic challenge nonce.
 * Requires API Key with scope auth:challenge.
 */
export async function requestChallenge(
  body: ChallengeRequest
): Promise<ChallengeResponse> {
  const res = await api.post<ChallengeResponse>('/auth/challenge', body);
  if (res.status >= 400) {
    const data = res.data as AuthErrorBody;
    const err = new Error(data?.message ?? `Request failed: ${res.status}`) as Error & {
      status?: number;
      code?: string;
    };
    err.status = res.status;
    err.code = data?.code;
    throw err;
  }
  return res.data;
}

/**
 * Epic 2, Story 2.2 — Verify signature and issue assertion token.
 * Requires API Key with scope auth:verify.
 */
export async function verifySignature(body: VerifyRequest): Promise<VerifyResponse> {
  const res = await api.post<VerifyResponse | AuthErrorBody>('/auth/verify', body);
  if (res.status >= 400) {
    const data = res.data as AuthErrorBody;
    const err = new Error(data?.message ?? `Verification failed: ${res.status}`) as Error & {
      status?: number;
      code?: string;
    };
    err.status = res.status;
    err.code = data?.code;
    throw err;
  }
  return res.data as VerifyResponse;
}
