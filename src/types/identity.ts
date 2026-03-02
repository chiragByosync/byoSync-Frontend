/**
 * Identity Registry API types (Part 1.1 — Backend spec)
 * Matches backend request/response for easy integration.
 */

export type KycLevel = 'BASIC' | 'STANDARD' | 'FULL';

export type Sector =
  | 'BFSI'
  | 'GOVT'
  | 'GIG'
  | 'EDU'
  | 'TRANSPORT'
  | 'HOTEL'
  | 'EVENT'
  | 'KIOSK'
  | 'ECOMM';

export type IdentityStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'PENDING';

/** Request body for POST /api/v1/identity/create. Backend hashes phone/email. */
export interface IdentityCreateRequest {
  public_key: string; // Base64 Ed25519 or ECDSA P-256
  kyc_level: KycLevel;
  sector: Sector;
  full_name: string;
  dob: string; // ISO date
  phone: string; // Backend hashes with SHA-256 before storage
  email?: string; // Optional; backend hashes if provided
  verifier_id: string; // UUID
  facility_id?: string; // UUID, optional
  device_id?: string; // required for GIG/TRANSPORT
  metadata?: Record<string, unknown>; // sector-specific JSON
}

/** Success response 201 for identity create */
export interface IdentityCreateResponse {
  uuid: string;
  status: IdentityStatus;
  kyc_level: KycLevel;
  sector: Sector;
  created_at: string; // ISO
  audit_ref: string;
  public_key_fingerprint: string;
}

/** Response for GET /api/v1/identity/:uuid (metadata - no PII in plain text) */
export interface IdentityMetadataResponse {
  uuid: string;
  status: IdentityStatus;
  kyc_level: KycLevel;
  sector: Sector;
  created_at: string;
  updated_at?: string;
  public_key_fingerprint?: string;
  verifier_id?: string;
  facility_id?: string | null;
}

/** Response for GET /api/v1/identity/:uuid/status */
export interface IdentityStatusResponse {
  uuid: string;
  status: IdentityStatus;
  updated_at?: string;
}

/** Story 1.2 — Lifecycle: POST /api/v1/identity/:uuid/suspend request body */
export interface IdentitySuspendRequest {
  reason: string;
  duration_hours?: number; // optional; if omitted, manual reactivation required
  operator_id: string; // UUID — admin operator performing the action
}

/** Story 1.2 — Lifecycle: POST /api/v1/identity/:uuid/revoke request body (audit) */
export interface IdentityRevokeRequest {
  reason: string;
  operator_id: string; // UUID
}

/** Single lifecycle event (identity_lifecycle_events collection) */
export interface LifecycleEvent {
  identity_uuid: string;
  status: IdentityStatus;
  reason?: string;
  actor_id?: string;
  created_at: string; // ISO
  event_type?: string; // e.g. SUSPENDED, REACTIVATED, REVOKED
}

/** GET /api/v1/identity/:uuid/history response */
export interface IdentityHistoryResponse {
  uuid: string;
  events: LifecycleEvent[];
}

/** Story 1.3 — Key rotation algorithm enum */
export type KeyAlgorithm = 'Ed25519' | 'ECDSA_P256';

/** POST /api/v1/identity/:uuid/keys/rotate request body */
export interface IdentityKeyRotateRequest {
  new_public_key: string; // Base64
  current_signature: string; // Base64 — sign rotate:{uuid}:{timestamp} with current private key
  algorithm: KeyAlgorithm;
}

/** Single key version in list (GET .../keys) */
export interface IdentityKeyItem {
  key_version: number;
  public_key_fingerprint?: string;
  algorithm: KeyAlgorithm;
  is_active: boolean;
  created_at: string; // ISO
}

/** GET /api/v1/identity/:uuid/keys response */
export interface IdentityKeysResponse {
  uuid: string;
  keys: IdentityKeyItem[];
}

/** API error shape for consistent handling */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}
