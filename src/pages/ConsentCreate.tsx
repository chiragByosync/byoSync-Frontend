import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FilePlus2, ArrowLeft } from 'lucide-react';
import { createConsent } from '../services/consentApi';
import type {
  ConsentCreateRequest,
  ConsentPurpose,
  DataScope,
  ConsentLanguage,
} from '../types/consent';
import {
  CONSENT_PURPOSES,
  DATA_SCOPES,
  CONSENT_LANGUAGES,
} from '../types/consent';
import { isValidUuid, isValidSha256Hex } from '../lib/validation';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FormSection } from '../components/FormSection';

const MAX_DURATION_HOURS = 8760; // 1 year

type FieldErrors = Partial<Record<string, string>>;

function validate(
  identity_uuid: string,
  verifier_id: string,
  purpose: ConsentPurpose,
  data_scope: DataScope[],
  duration_hours: number,
  consent_ui_hash: string
): FieldErrors {
  const err: FieldErrors = {};
  if (!identity_uuid?.trim()) err.identity_uuid = 'Identity UUID is required';
  else if (!isValidUuid(identity_uuid)) err.identity_uuid = 'Must be a valid UUID';
  if (!verifier_id?.trim()) err.verifier_id = 'Verifier ID is required';
  else if (!isValidUuid(verifier_id)) err.verifier_id = 'Must be a valid UUID';
  if (!purpose) err.purpose = 'Purpose is required';
  if (!data_scope?.length) err.data_scope = 'Select at least one data scope';
  if (duration_hours == null || duration_hours < 1)
    err.duration_hours = 'Duration must be at least 1 hour';
  else if (duration_hours > MAX_DURATION_HOURS)
    err.duration_hours = `Max ${MAX_DURATION_HOURS} hours (1 year)`;
  if (consent_ui_hash?.trim() && !isValidSha256Hex(consent_ui_hash))
    err.consent_ui_hash = 'Must be 64-character SHA-256 hex';
  return err;
}

const inputBase =
  'input-focus mt-1 w-full rounded-xl border bg-[var(--byosync-gray-50)]/50 px-4 py-2.5 text-[var(--byosync-gray-900)] placeholder:text-[var(--byosync-gray-500)] transition hover:border-[var(--byosync-gray-300)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20 focus:border-[var(--byosync-blue)]';
const inputError = 'border-red-400 focus:ring-red-200 focus:border-red-500';
const inputOk = 'border-[var(--byosync-gray-200)]';

export function ConsentCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [identity_uuid, setIdentityUuid] = useState('');
  const [verifier_id, setVerifierId] = useState('');
  const [purpose, setPurpose] = useState<ConsentPurpose>('ATTENDANCE');
  const [data_scope, setDataScope] = useState<DataScope[]>(['IDENTITY_CONFIRM']);
  const [duration_hours, setDurationHours] = useState('24');
  const [session_constraint, setSessionConstraint] = useState(false);
  const [language, setLanguage] = useState<ConsentLanguage>('EN');
  const [consent_ui_hash, setConsentUiHash] = useState('');
  const [location_json, setLocationJson] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof createConsent>> | null>(null);

  useEffect(() => {
    const state = location.state as { verifier_id?: string; identity_uuid?: string; purpose?: ConsentPurpose } | undefined;
    if (state?.verifier_id) setVerifierId(state.verifier_id);
    if (state?.identity_uuid) setIdentityUuid(state.identity_uuid);
    if (state?.purpose && CONSENT_PURPOSES.includes(state.purpose)) setPurpose(state.purpose);
  }, [location.state]);

  const toggleScope = useCallback((scope: DataScope) => {
    setDataScope((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
    setErrors((e) => ({ ...e, data_scope: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const dur = parseInt(duration_hours, 10);
      const fieldErrors = validate(
        identity_uuid,
        verifier_id,
        purpose,
        data_scope,
        dur,
        consent_ui_hash
      );
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return;
      }

      const payload: ConsentCreateRequest = {
        identity_uuid: identity_uuid.trim(),
        verifier_id: verifier_id.trim(),
        purpose,
        data_scope,
        duration_hours: dur,
      };
      if (session_constraint) payload.session_constraint = true;
      if (language) payload.language = language;
      if (consent_ui_hash.trim()) payload.consent_ui_hash = consent_ui_hash.trim();
      if (location_json.trim()) {
        try {
          payload.location_constraint = JSON.parse(location_json) as ConsentCreateRequest['location_constraint'];
        } catch {
          setErrors((prev) => ({ ...prev, location_json: 'Invalid JSON' }));
          return;
        }
      }

      setLoading(true);
      setSubmitError(null);
      setResult(null);
      try {
        const res = await createConsent(payload);
        setResult(res);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create consent.';
        const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
        if (status === 401) setSubmitError('Authentication required (JWT with consent:write).');
        else if (status === 403) setSubmitError('Verifier or scope not allowed.');
        else setSubmitError(msg);
      } finally {
        setLoading(false);
      }
    },
    [
      identity_uuid,
      verifier_id,
      purpose,
      data_scope,
      duration_hours,
      session_constraint,
      language,
      consent_ui_hash,
      location_json,
    ]
  );

  if (result) {
    return (
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="heading-page">Consent created</h1>
          <p className="mt-3 subheading">
            DPDP-aligned consent record created. Verifier can use it for the stated purpose and scope.
          </p>
        </motion.div>
        <FormSection
          title="Consent record"
          description="Store consent_id for audit and revocation."
          icon={<FilePlus2 className="h-5 w-5" strokeWidth={2} />}
          className="border-emerald-200 bg-emerald-50/20"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Consent ID</p>
              <p className="mt-0.5 font-mono text-sm font-medium text-[var(--byosync-gray-900)]">{result.consent_id}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Status</p>
              <p className="mt-0.5 text-sm font-semibold text-emerald-700">{result.status}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Purpose</p>
              <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{result.purpose}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Data scope</p>
              <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{result.data_scope.join(', ')}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Valid from</p>
              <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{result.valid_from}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Valid until</p>
              <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{result.valid_until}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => { setResult(null); }}
              className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white"
            >
              Create another
            </button>
            <button
              type="button"
              onClick={() => navigate('/consent')}
              className="btn-secondary flex items-center gap-2 rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Consent
            </button>
          </div>
        </FormSection>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="heading-page">Create consent</h1>
        <p className="mt-3 subheading">
          DPDP 2023 aligned. Consent must be specific, informed, and bounded. Requires JWT (identity holder) with consent:write.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {submitError && (
          <ErrorMessage title="Create failed" onRetry={() => setSubmitError(null)}>
            {submitError}
          </ErrorMessage>
        )}

        <FormSection
          title="Parties & purpose"
          description="Identity granting consent and verifier receiving it."
          icon={<FilePlus2 className="h-5 w-5" strokeWidth={2} />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
                Identity UUID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={identity_uuid}
                onChange={(e) => {
                  setIdentityUuid(e.target.value);
                  setErrors((p) => ({ ...p, identity_uuid: undefined }));
                }}
                placeholder="byos_..."
                className={`${inputBase} font-mono text-sm ${errors.identity_uuid ? inputError : inputOk}`}
                disabled={loading}
              />
              {errors.identity_uuid && (
                <p className="mt-1.5 text-sm text-red-600">{errors.identity_uuid}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
                Verifier ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={verifier_id}
                onChange={(e) => {
                  setVerifierId(e.target.value);
                  setErrors((p) => ({ ...p, verifier_id: undefined }));
                }}
                placeholder="UUID"
                className={`${inputBase} font-mono text-sm ${errors.verifier_id ? inputError : inputOk}`}
                disabled={loading}
              />
              {errors.verifier_id && (
                <p className="mt-1.5 text-sm text-red-600">{errors.verifier_id}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Purpose <span className="text-red-500">*</span>
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as ConsentPurpose)}
              className={`${inputBase} ${errors.purpose ? inputError : inputOk}`}
              disabled={loading}
            >
              {CONSENT_PURPOSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </FormSection>

        <FormSection
          title="Data scope"
          description="Fields the verifier may access. At least one required."
          icon="◇"
        >
          <div className="flex flex-wrap gap-3">
            {DATA_SCOPES.map((scope) => (
              <label
                key={scope}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-4 py-2.5 text-sm font-medium transition hover:border-[var(--byosync-gray-300)] has-[:checked]:border-[var(--byosync-blue)] has-[:checked]:bg-[var(--byosync-blue-pale)]"
              >
                <input
                  type="checkbox"
                  checked={data_scope.includes(scope)}
                  onChange={() => toggleScope(scope)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-[var(--byosync-gray-300)] text-[var(--byosync-blue)] focus:ring-[var(--byosync-blue)]"
                />
                {scope}
              </label>
            ))}
          </div>
          {errors.data_scope && (
            <p className="mt-1.5 text-sm text-red-600">{errors.data_scope}</p>
          )}
        </FormSection>

        <FormSection
          title="Validity & constraints"
          description="Duration (max 8760 hours) and optional constraints."
          icon="◎"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Duration (hours) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={MAX_DURATION_HOURS}
              value={duration_hours}
              onChange={(e) => {
                setDurationHours(e.target.value);
                setErrors((p) => ({ ...p, duration_hours: undefined }));
              }}
              className={`${inputBase} ${errors.duration_hours ? inputError : inputOk}`}
              disabled={loading}
            />
            <p className="mt-1 text-xs text-[var(--byosync-gray-500)]">Max 8760 (1 year). GATE_ENTRY often 24h.</p>
            {errors.duration_hours && (
              <p className="mt-1.5 text-sm text-red-600">{errors.duration_hours}</p>
            )}
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={session_constraint}
              onChange={(e) => setSessionConstraint(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-[var(--byosync-gray-300)] text-[var(--byosync-blue)]"
            />
            <span className="text-sm font-medium text-[var(--byosync-gray-700)]">Single session only</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as ConsentLanguage)}
              className={`${inputBase} ${inputOk}`}
              disabled={loading}
            >
              {CONSENT_LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Location constraint (JSON, optional)
            </label>
            <textarea
              value={location_json}
              onChange={(e) => {
                setLocationJson(e.target.value);
                setErrors((p) => ({ ...p, location_json: undefined }));
              }}
              placeholder='{"type":"circle","coordinates":[77.2,28.6],"radius_km":5}'
              rows={2}
              className={`${inputBase} font-mono text-sm ${errors.location_json ? inputError : inputOk}`}
              disabled={loading}
            />
            {errors.location_json && (
              <p className="mt-1.5 text-sm text-red-600">{errors.location_json}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Consent UI hash (SHA-256 hex, optional)
            </label>
            <input
              type="text"
              value={consent_ui_hash}
              onChange={(e) => {
                setConsentUiHash(e.target.value);
                setErrors((p) => ({ ...p, consent_ui_hash: undefined }));
              }}
              placeholder="64-character hex"
              className={`${inputBase} font-mono text-sm ${errors.consent_ui_hash ? inputError : inputOk}`}
              disabled={loading}
            />
            {errors.consent_ui_hash && (
              <p className="mt-1.5 text-sm text-red-600">{errors.consent_ui_hash}</p>
            )}
          </div>
        </FormSection>

        <div className="flex flex-wrap gap-4 border-t border-[var(--byosync-gray-200)] pt-8">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 rounded-xl bg-[var(--byosync-blue)] px-6 py-3 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/25 disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoadingSpinner className="h-4 w-4" /> Creating…
              </>
            ) : (
              'Create consent'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/consent')}
            className="btn-secondary flex items-center gap-2 rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-6 py-3 font-semibold text-[var(--byosync-gray-700)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </form>
    </div>
  );
}
