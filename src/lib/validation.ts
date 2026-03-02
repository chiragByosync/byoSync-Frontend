/** UUID v4 pattern (optional byos_ prefix per spec) */
const UUID_REGEX =
  /^(byos_)?[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Base64 pattern (standard alphabet, optional padding) */
const BASE64_REGEX = /^[A-Za-z0-9+/]+=*$/;

/** SHA-256 hex is 64 hex chars */
const SHA256_HEX_REGEX = /^[a-f0-9]{64}$/i;

/** ISO date YYYY-MM-DD */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidUuid(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return UUID_REGEX.test(value.trim());
}

export function isValidBase64(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!BASE64_REGEX.test(trimmed)) return false;
  try {
    atob(trimmed.replace(/-/g, '+').replace(/_/g, '/'));
    return true;
  } catch {
    return false;
  }
}

export function isValidSha256Hex(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return SHA256_HEX_REGEX.test(value.trim());
}

export function isValidIsoDate(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  if (!ISO_DATE_REGEX.test(value.trim())) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

export function isValidJson(value: string): boolean {
  if (value === '') return true;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export const KYC_LEVELS = ['BASIC', 'STANDARD', 'FULL'] as const;
export const SECTORS = [
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
