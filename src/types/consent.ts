/**
 * Epic 4 — Consent Engine
 * Story 4.1 — Consent Creation (DPDP 2023 aligned)
 */

export const CONSENT_PURPOSES = [
  'ATTENDANCE',
  'KYC_VERIFICATION',
  'BACKGROUND_CHECK',
  'TRANSACTION_AUTH',
  'GATE_ENTRY',
  'HOTEL_CHECKIN',
  'EVENT_ENTRY',
] as const;

export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number];

export const DATA_SCOPES = [
  'IDENTITY_CONFIRM',
  'NAME',
  'DOB',
  'PHONE',
  'ADDRESS',
  'EMPLOYMENT',
  'DOCUMENTS',
] as const;

export type DataScope = (typeof DATA_SCOPES)[number];

export const CONSENT_LANGUAGES = ['EN', 'HI', 'TA', 'TE', 'MR', 'BN'] as const;

export type ConsentLanguage = (typeof CONSENT_LANGUAGES)[number];

export type ConsentStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

/** Optional geo-fence for consent validity */
export interface LocationConstraint {
  type?: string;
  coordinates?: number[];
  radius_km?: number;
  [key: string]: unknown;
}

/** POST /api/v1/consent/create — Request body */
export interface ConsentCreateRequest {
  identity_uuid: string;
  verifier_id: string;
  purpose: ConsentPurpose;
  data_scope: DataScope[];
  duration_hours: number;
  location_constraint?: LocationConstraint;
  session_constraint?: boolean;
  language?: ConsentLanguage;
  consent_ui_hash?: string;
}

/** POST /api/v1/consent/create — 201 Created */
export interface ConsentCreateResponse {
  consent_id: string;
  status: ConsentStatus;
  purpose: string;
  data_scope: string[];
  valid_from: string;
  valid_until: string;
  revocable: boolean;
}

/** GET /api/v1/consent/:consent_id — Consent details */
export interface ConsentDetailResponse {
  consent_id: string;
  identity_uuid: string;
  verifier_id: string;
  purpose: string;
  data_scope: string[];
  status: ConsentStatus;
  valid_from: string;
  valid_until: string;
  revocable?: boolean;
  location_constraint?: LocationConstraint;
  session_constraint?: boolean;
  language?: string;
  consent_ui_hash?: string;
  revoked_at?: string;
  revoked_by?: string;
  revoke_reason?: string;
  created_at?: string;
  updated_at?: string;
}

/** GET /api/v1/consent/identity/:uuid/active — List active consents */
export interface ConsentListItem {
  consent_id: string;
  verifier_id: string;
  purpose: string;
  data_scope: string[];
  valid_from: string;
  valid_until: string;
  status: ConsentStatus;
  revocable?: boolean;
}

export interface ConsentListResponse {
  identity_uuid: string;
  consents: ConsentListItem[];
}

/** Story 4.2 — Consent enforcement middleware 403 error codes */
export const CONSENT_ERROR_CODES = [
  'CONSENT_REQUIRED',
  'CONSENT_EXPIRED',
  'CONSENT_REVOKED',
  'SCOPE_EXCEEDED',
  'CONSENT_LOCATION_REQUIRED',
  'CONSENT_SESSION_REQUIRED',
] as const;

export type ConsentErrorCode = (typeof CONSENT_ERROR_CODES)[number];

/** Payload stored when redirecting to consent required page (e.g. SCOPE_EXCEEDED details) */
export interface ConsentErrorPayload {
  code: ConsentErrorCode;
  message?: string;
  requested_scope?: string[];
  approved_scope?: string[];
  verifier_id?: string;
  identity_uuid?: string;
  purpose?: string;
}

/** Story 4.3 — POST /consent/:consent_id/revoke and POST /consent/identity/:uuid/revoke-all request body */
export interface ConsentRevokeRequest {
  revoke_reason?: string;
}
