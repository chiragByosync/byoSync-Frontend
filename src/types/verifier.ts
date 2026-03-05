/**
 * Epic 5 — Verifier Management
 * Story 5.1 — Verifier Registration
 */

export const VERIFIER_SECTORS = [
  'BFSI',
  'GOVT',
  'GIG',
  'EDU',
  'TRANSPORT',
  'HOTEL',
  'EVENT',
  'KIOSK',
  'ECOMM',
] as const;

export type VerifierSector = (typeof VERIFIER_SECTORS)[number];

export const TRUST_TIERS = ['STANDARD', 'ENHANCED', 'GOVERNMENT'] as const;

export type TrustTier = (typeof TRUST_TIERS)[number];

/** Purposes this verifier is allowed to request (subset of consent purposes) */
export const VERIFIER_PURPOSES = [
  'ATTENDANCE',
  'KYC_VERIFICATION',
  'BACKGROUND_CHECK',
  'TRANSACTION_AUTH',
  'GATE_ENTRY',
  'HOTEL_CHECKIN',
  'EVENT_ENTRY',
] as const;

export type VerifierPurpose = (typeof VERIFIER_PURPOSES)[number];

/** Data scopes this verifier can request */
export const VERIFIER_SCOPES = [
  'IDENTITY_CONFIRM',
  'NAME',
  'DOB',
  'PHONE',
  'ADDRESS',
  'EMPLOYMENT',
  'DOCUMENTS',
] as const;

export type VerifierScope = (typeof VERIFIER_SCOPES)[number];

/** POST /api/v1/verifier/register — Request body */
export interface VerifierRegisterRequest {
  org_name: string;
  sector: VerifierSector;
  contact_email: string;
  allowed_purposes: VerifierPurpose[];
  allowed_scopes: VerifierScope[];
  trust_tier: TrustTier;
  webhook_url?: string;
  ip_whitelist?: string[];
  rate_limit_per_min?: number;
}

/** 201 Created — Registration response (api_key shown ONCE) */
export interface VerifierRegisterResponse {
  verifier_id: string;
  api_key: string;
  trust_tier: TrustTier;
  allowed_purposes: VerifierPurpose[];
  rate_limit_per_min: number;
  jwks_url?: string;
}

/** GET /api/v1/verifier/:id — Verifier profile (no api_key) */
export interface VerifierProfile {
  verifier_id: string;
  org_name: string;
  sector: VerifierSector;
  contact_email: string;
  allowed_purposes: VerifierPurpose[];
  allowed_scopes: VerifierScope[];
  trust_tier: TrustTier;
  webhook_url?: string;
  ip_whitelist?: string[];
  rate_limit_per_min?: number;
  jwks_url?: string;
  created_at?: string;
  updated_at?: string;
}

/** PUT /api/v1/verifier/:id — Update body (partial) */
export interface VerifierUpdateRequest {
  org_name?: string;
  contact_email?: string;
  allowed_purposes?: VerifierPurpose[];
  allowed_scopes?: VerifierScope[];
  webhook_url?: string;
  ip_whitelist?: string[];
  rate_limit_per_min?: number;
}

/** POST /api/v1/verifier/:id/api-key/rotate — New key shown ONCE */
export interface VerifierRotateKeyResponse {
  api_key: string;
  rotated_at?: string;
}

/** GET /api/v1/verifier/:id/usage — Usage stats (backend-defined shape) */
export interface VerifierUsageResponse {
  verifier_id: string;
  period?: { from: string; to: string };
  requests_count?: number;
  requests_per_min?: number;
  [key: string]: unknown;
}
