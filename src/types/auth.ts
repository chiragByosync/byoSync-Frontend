/**
 * Epic 2 — Cryptographic Challenge-Response Service
 * Story 2.1 — Challenge Generation
 */

export type ChallengePurpose =
  | 'ATTENDANCE'
  | 'KYC'
  | 'GATE_ENTRY'
  | 'TRANSACTION'
  | 'ONBOARDING'
  | 'CHECK_IN';

/** Optional location captured at challenge time */
export interface ChallengeLocation {
  lat?: number;
  lng?: number;
  facility_id?: string;
  ip?: string;
}

/** POST /api/v1/auth/challenge — Request body */
export interface ChallengeRequest {
  identity_uuid: string;
  verifier_id: string;
  purpose: ChallengePurpose;
  location?: ChallengeLocation;
  device_id?: string;
}

/** POST /api/v1/auth/challenge — 200 OK response */
export interface ChallengeResponse {
  session_id: string;
  nonce: string; // 32-byte secure random, Base64
  challenge_string: string; // byosync:v1:{nonce}:{identity_uuid}:{verifier_id}:{timestamp}
  expires_at: string; // ISO, 60s TTL
  algorithm: string; // e.g. Ed25519
  instructions: string;
}

/** Story 2.2 — Optional location at time of signing */
export interface VerifyLocation {
  lat?: number;
  lng?: number;
  facility_id?: string;
}

/** POST /api/v1/auth/verify — Request body */
export interface VerifyRequest {
  session_id: string;
  signature: string; // Base64
  location?: VerifyLocation;
}

/** POST /api/v1/auth/verify — 200 OK response */
export interface VerifyResponse {
  assertion_token: string; // Signed JWT
  token_type: string; // e.g. Bearer
  expires_in: number; // seconds, e.g. 300
  verification_id: string;
  identity_uuid: string;
  purpose: string;
  verified_at: string; // ISO
}

/** Error response body (4xx) */
export interface AuthErrorBody {
  message?: string;
  code?: string; // NONCE_EXPIRED | REPLAY_DETECTED | SIGNATURE_INVALID | etc.
}

/** Story 2.3 — Decoded assertion JWT payload (standard + bys: claims) */
export interface AssertionTokenPayload {
  iss?: string;
  sub?: string;   // identity_uuid
  aud?: string;  // verifier_id
  iat?: number;
  exp?: number;
  jti?: string;  // verification_id
  'bys:purpose'?: string;
  'bys:nonce'?: string;
  'bys:session'?: string;
  'bys:kyc_level'?: string;
  'bys:sector'?: string;
  'bys:location'?: {
    lat?: number;
    lng?: number;
    facility_id?: string;
    verified?: boolean;
  };
  'bys:consent_id'?: string;
  'bys:key_version'?: number;
  'bys:device_id'?: string;
  [key: string]: unknown;
}
