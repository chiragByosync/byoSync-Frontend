import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIdentity } from '../services/identityApi';
import type { IdentityCreateRequest, KycLevel, Sector } from '../types/identity';
import {
  isValidUuid,
  isValidBase64,
  isValidIsoDate,
  isValidJson,
  KYC_LEVELS,
  SECTORS,
} from '../lib/validation';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FormSection } from '../components/FormSection';

type FormData = IdentityCreateRequest & { metadata_json?: string };
type FieldErrors = Partial<Record<keyof FormData, string>>;

function validateForm(data: FormData): FieldErrors {
  const err: FieldErrors = {};
  if (!data.public_key?.trim()) err.public_key = 'Public key is required';
  else if (!isValidBase64(data.public_key))
    err.public_key = 'Must be valid Base64 (Ed25519 or ECDSA P-256)';
  if (!data.kyc_level) err.kyc_level = 'KYC level is required';
  else if (!KYC_LEVELS.includes(data.kyc_level)) err.kyc_level = 'Invalid KYC level';
  if (!data.sector) err.sector = 'Sector is required';
  else if (!SECTORS.includes(data.sector)) err.sector = 'Invalid sector';
  if (!data.full_name?.trim()) err.full_name = 'Full name is required';
  if (!data.dob?.trim()) err.dob = 'Date of birth is required';
  else if (!isValidIsoDate(data.dob)) err.dob = 'Use ISO date (YYYY-MM-DD)';
  if (!data.phone?.trim()) err.phone = 'Phone number is required';
  if (!data.verifier_id?.trim()) err.verifier_id = 'Verifier ID is required';
  else if (!isValidUuid(data.verifier_id)) err.verifier_id = 'Must be a valid UUID';
  if (data.facility_id?.trim() && !isValidUuid(data.facility_id))
    err.facility_id = 'Must be a valid UUID';
  if (data.metadata_json?.trim() && !isValidJson(data.metadata_json))
    err.metadata_json = 'Must be valid JSON';
  return err;
}

const initialForm: FormData = {
  public_key: '',
  kyc_level: 'STANDARD',
  sector: 'BFSI',
  full_name: '',
  dob: '',
  phone: '',
  email: '',
  verifier_id: '',
  facility_id: '',
  device_id: '',
  metadata_json: '',
};

const inputBase =
  'input-focus mt-1 w-full rounded-xl border bg-[var(--byosync-gray-50)]/50 px-4 py-2.5 text-[var(--byosync-gray-900)] placeholder:text-[var(--byosync-gray-500)] transition hover:border-[var(--byosync-gray-300)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20 focus:border-[var(--byosync-blue)]';
const inputError = 'border-red-400 focus:ring-red-200 focus:border-red-500';
const inputOk = 'border-[var(--byosync-gray-200)]';

export function IdentityCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = useCallback((field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const payload: IdentityCreateRequest = {
        public_key: form.public_key.trim(),
        kyc_level: form.kyc_level as KycLevel,
        sector: form.sector as Sector,
        full_name: form.full_name.trim(),
        dob: form.dob.trim(),
        phone: form.phone.trim(),
        verifier_id: form.verifier_id.trim(),
      };
      if (form.email?.trim()) payload.email = form.email.trim();
      if (form.facility_id?.trim()) payload.facility_id = form.facility_id.trim();
      if (form.device_id?.trim()) payload.device_id = form.device_id.trim();
      if (form.metadata_json?.trim()) {
        try {
          payload.metadata = JSON.parse(
            form.metadata_json
          ) as Record<string, unknown>;
        } catch {
          setErrors((prev) => ({ ...prev, metadata_json: 'Invalid JSON' }));
          return;
        }
      }

      const fieldErrors = validateForm({ ...form, ...payload });
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      setSubmitError(null);
      try {
        const res = await createIdentity(payload);
        navigate(`/identity/${encodeURIComponent(res.uuid)}`, {
          state: { created: res },
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to create identity.';
        const status =
          err && typeof err === 'object' && 'status' in err
            ? (err.status as number)
            : 0;
        if (status === 409)
          setSubmitError('An identity with this phone number already exists.');
        else setSubmitError(message);
      } finally {
        setLoading(false);
      }
    },
    [form, navigate]
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="heading-page">Create Identity</h1>
        <p className="mt-3 subheading">
          Register a new identity. Personal data is encrypted at rest.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {submitError && (
          <ErrorMessage
            title="Submission failed"
            onRetry={() => setSubmitError(null)}
          >
            {submitError}
          </ErrorMessage>
        )}

        {/* SECTION 1 — Identity Information */}
        <FormSection
          title="Identity Information"
          description="Core identity anchors and classification"
          icon="◇"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Public key (Base64) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.public_key}
              onChange={(e) => update('public_key', e.target.value)}
              placeholder="Ed25519 or ECDSA P-256 public key, Base64-encoded"
              rows={3}
              className={`${inputBase} font-mono text-sm ${errors.public_key ? inputError : inputOk}`}
              disabled={loading}
            />
            {errors.public_key && (
              <p className="mt-1.5 text-sm text-red-600">{errors.public_key}</p>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
                KYC level <span className="text-red-500">*</span>
              </label>
              <select
                value={form.kyc_level}
                onChange={(e) => update('kyc_level', e.target.value)}
                className={`${inputBase} ${errors.kyc_level ? inputError : inputOk}`}
                disabled={loading}
              >
                {KYC_LEVELS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              {errors.kyc_level && (
                <p className="mt-1.5 text-sm text-red-600">{errors.kyc_level}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
                Sector <span className="text-red-500">*</span>
              </label>
              <select
                value={form.sector}
                onChange={(e) => update('sector', e.target.value)}
                className={`${inputBase} ${errors.sector ? inputError : inputOk}`}
                disabled={loading}
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.sector && (
                <p className="mt-1.5 text-sm text-red-600">{errors.sector}</p>
              )}
            </div>
          </div>
        </FormSection>

        {/* SECTION 2 — Personal Details */}
        <FormSection
          title="Personal Details"
          description="Name, date of birth, and contact. Backend hashes phone and email."
          icon="◈"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              placeholder="As on official documents"
              className={`${inputBase} ${errors.full_name ? inputError : inputOk}`}
              disabled={loading}
            />
            {errors.full_name && (
              <p className="mt-1.5 text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Date of birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => update('dob', e.target.value)}
              className={`${inputBase} ${errors.dob ? inputError : inputOk}`}
              disabled={loading}
            />
            {errors.dob && (
              <p className="mt-1.5 text-sm text-red-600">{errors.dob}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="Mobile number"
              className={`${inputBase} ${errors.phone ? inputError : inputOk}`}
              disabled={loading}
            />
            {errors.phone && (
              <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Email <span className="text-[var(--byosync-gray-500)]">(optional)</span>
            </label>
            <input
              type="email"
              value={form.email ?? ''}
              onChange={(e) => update('email', e.target.value)}
              placeholder="Optional"
              className={inputBase + ' ' + inputOk}
              disabled={loading}
            />
          </div>
        </FormSection>

        {/* SECTION 3 — Verification Details */}
        <FormSection
          title="Verification Details"
          description="Verifier, facility, and device binding"
          icon="◎"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Verifier ID (UUID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.verifier_id}
              onChange={(e) => update('verifier_id', e.target.value)}
              placeholder="e.g. byos_7f3a9c2d-..."
              className={`${inputBase} font-mono text-sm ${errors.verifier_id ? inputError : inputOk}`}
              disabled={loading}
            />
            {errors.verifier_id && (
              <p className="mt-1.5 text-sm text-red-600">{errors.verifier_id}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Facility ID (UUID) <span className="text-[var(--byosync-gray-500)]">(optional)</span>
            </label>
            <input
              type="text"
              value={form.facility_id ?? ''}
              onChange={(e) => update('facility_id', e.target.value)}
              placeholder="If created at a specific facility"
              className={`${inputBase} font-mono text-sm ${errors.facility_id ? inputError : inputOk}`}
              disabled={loading}
            />
            {errors.facility_id && (
              <p className="mt-1.5 text-sm text-red-600">{errors.facility_id}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Device ID <span className="text-[var(--byosync-gray-500)]">(optional; required for GIG/TRANSPORT)</span>
            </label>
            <input
              type="text"
              value={form.device_id ?? ''}
              onChange={(e) => update('device_id', e.target.value)}
              placeholder="Device fingerprint for binding"
              className={inputBase + ' ' + inputOk}
              disabled={loading}
            />
          </div>
        </FormSection>

        {/* SECTION 4 — Metadata */}
        <FormSection
          title="Metadata"
          description="Sector-specific JSON (optional)"
          icon="▣"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Sector metadata (JSON)
            </label>
            <textarea
              value={form.metadata_json ?? ''}
              onChange={(e) => update('metadata_json', e.target.value)}
              placeholder='{"key": "value"}'
              rows={4}
              className={`${inputBase} font-mono text-sm ${errors.metadata_json ? inputError : inputOk}`}
              disabled={loading}
            />
            {errors.metadata_json && (
              <p className="mt-1.5 text-sm text-red-600">{errors.metadata_json}</p>
            )}
          </div>
        </FormSection>

        <div className="flex flex-wrap items-center gap-4 border-t border-[var(--byosync-gray-200)] pt-8">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-6 py-3 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/25 disabled:opacity-60 disabled:hover:transform-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner className="h-4 w-4" /> Creating…
              </span>
            ) : (
              'Create Identity'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/identity')}
            className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-6 py-3 font-semibold text-[var(--byosync-gray-700)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
