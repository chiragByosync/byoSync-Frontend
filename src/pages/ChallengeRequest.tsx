import { useState, useCallback, useEffect } from 'react';
import { requestChallenge, verifySignature } from '../services/authApi';
import { TokenService } from '../services/TokenService';
import type {
  ChallengeRequest,
  ChallengePurpose,
  ChallengeLocation,
  VerifyResponse,
  VerifyLocation,
} from '../types/auth';
import { isValidUuid } from '../lib/validation';
import { decodeJwtPayload, formatJwtTimestamp } from '../lib/jwt';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FormSection } from '../components/FormSection';
import { Link } from 'react-router-dom';

/** Mask assertion token for UI — never show full token. */
function maskToken(token: string): string {
  if (token.length <= 24) return '••••••••';
  return token.slice(0, 12) + '…' + token.slice(-8);
}

const PURPOSES: ChallengePurpose[] = [
  'ATTENDANCE',
  'KYC',
  'GATE_ENTRY',
  'TRANSACTION',
  'ONBOARDING',
  'CHECK_IN',
];

const initialForm: ChallengeRequest & {
  lat?: string;
  lng?: string;
  facility_id?: string;
  location_ip?: string;
} = {
  identity_uuid: '',
  verifier_id: '',
  purpose: 'KYC',
  lat: '',
  lng: '',
  facility_id: '',
  location_ip: '',
  device_id: '',
};

function formatExpiry(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const secs = Math.max(0, Math.round((d.getTime() - now.getTime()) / 1000));
    return `${iso} (${secs}s remaining)`;
  } catch {
    return iso;
  }
}

function DecodedPayloadDisplay({ token }: { token: string }) {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return <p className="text-sm text-[var(--byosync-gray-500)]">Could not decode token payload.</p>;
  }
  const bys = (k: string): string => {
    const v = payload[k];
    if (v == null) return '—';
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  };
  const loc = payload['bys:location'];
  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--byosync-gray-500)]">Standard claims</p>
      <dl className="grid gap-2 sm:grid-cols-2">
        <Claim label="iss" value={payload.iss} />
        <Claim label="sub (identity)" value={payload.sub} mono />
        <Claim label="aud (verifier)" value={payload.aud} mono />
        <Claim label="iat" value={payload.iat != null ? formatJwtTimestamp(payload.iat) : '—'} />
        <Claim label="exp" value={payload.exp != null ? formatJwtTimestamp(payload.exp) : '—'} />
        <Claim label="jti (verification_id)" value={payload.jti} mono />
      </dl>
      <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-[var(--byosync-gray-500)]">ByoSync claims (bys:)</p>
      <dl className="grid gap-2 sm:grid-cols-2">
        <Claim label="bys:purpose" value={bys('bys:purpose')} />
        <Claim label="bys:kyc_level" value={bys('bys:kyc_level')} />
        <Claim label="bys:sector" value={bys('bys:sector')} />
        <Claim label="bys:session" value={bys('bys:session')} mono />
        <Claim label="bys:key_version" value={payload['bys:key_version'] != null ? String(payload['bys:key_version']) : '—'} />
        <Claim label="bys:device_id" value={bys('bys:device_id')} mono />
        {loc && typeof loc === 'object' && (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-[var(--byosync-gray-500)]">bys:location</p>
            <p className="mt-0.5 font-mono text-xs text-[var(--byosync-gray-700)]">
              lat={loc.lat ?? '—'} lng={loc.lng ?? '—'} facility_id={loc.facility_id ?? '—'} verified={loc.verified ?? '—'}
            </p>
          </div>
        )}
      </dl>
    </div>
  );
}

function Claim({ label, value, mono }: { label: string; value: string | undefined; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium text-[var(--byosync-gray-500)]">{label}</dt>
      <dd className={`mt-0.5 text-[var(--byosync-gray-900)] ${mono ? 'font-mono text-xs' : ''}`}>{value ?? '—'}</dd>
    </div>
  );
}

export function ChallengeRequest() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof requestChallenge>> | null>(null);
  const [verifySignatureInput, setVerifySignatureInput] = useState('');
  const [verifyLat, setVerifyLat] = useState('');
  const [verifyLng, setVerifyLng] = useState('');
  const [verifyFacilityId, setVerifyFacilityId] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [tokenDetailsOpen, setTokenDetailsOpen] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const update = useCallback(
    (field: string, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      setSubmitError(null);
      setResult(null);
      setVerifyError(null);
      setVerifyResult(null);
    },
    []
  );

  function getVerifyErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'code' in err) {
      const code = (err as { code?: string }).code;
      switch (code) {
        case 'NONCE_EXPIRED':
          return 'Challenge has expired. Request a new challenge.';
        case 'REPLAY_DETECTED':
          return 'Nonce already used (replay detected). Request a new challenge.';
        case 'SIGNATURE_INVALID':
          return 'Signature does not match. Check the signed challenge_string.';
        case 'IDENTITY_SUSPENDED':
          return 'Identity is currently suspended.';
        case 'IDENTITY_REVOKED':
          return 'Identity has been permanently revoked.';
        case 'DEVICE_MISMATCH':
          return 'Request from an unregistered device.';
        case 'GEO_FENCE_VIOLATION':
          return 'Location outside allowed zone.';
        case 'RATE_LIMIT_EXCEEDED':
          return 'Too many verification attempts. Try again after cooldown.';
      }
    }
    const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
    if (status === 429) return 'Too many attempts. Try again after cooldown.';
    if (status === 401) return 'Verification failed (expired, replay, or invalid signature).';
    if (status === 403) return 'Verification not allowed (identity or device policy).';
    return err instanceof Error ? err.message : 'Verification failed.';
  }

  const handleVerify = useCallback(async () => {
    if (!result?.session_id || !verifySignatureInput.trim()) return;
    setVerifyLoading(true);
    setVerifyError(null);
    setVerifyResult(null);
    try {
      const payload: Parameters<typeof verifySignature>[0] = {
        session_id: result.session_id,
        signature: verifySignatureInput.trim(),
      };
      const loc: VerifyLocation = {};
      if (verifyLat.trim()) loc.lat = parseFloat(verifyLat);
      if (verifyLng.trim()) loc.lng = parseFloat(verifyLng);
      if (verifyFacilityId.trim()) loc.facility_id = verifyFacilityId.trim();
      if (Object.keys(loc).length > 0) payload.location = loc;
      const res = await verifySignature(payload);
      setVerifyResult(res);
      TokenService.setToken(res.assertion_token, res.expires_in);
      setTokenExpired(false);
      setSecondsRemaining(res.expires_in);
    } catch (err: unknown) {
      setVerifyError(getVerifyErrorMessage(err));
    } finally {
      setVerifyLoading(false);
    }
  }, [result?.session_id, verifySignatureInput, verifyLat, verifyLng, verifyFacilityId]);

  // Story 2.3: track assertion token expiry; clear when expired
  useEffect(() => {
    if (!verifyResult) return;
    const t = setInterval(() => {
      const secs = TokenService.secondsUntilExpiry();
      setSecondsRemaining(secs > 0 ? secs : null);
      if (TokenService.isExpired()) {
        TokenService.clear();
        setTokenExpired(true);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [verifyResult]);

  const handleReAuth = useCallback(() => {
    TokenService.clear();
    setTokenExpired(false);
    setVerifyResult(null);
    setResult(null);
    setSecondsRemaining(null);
    setVerifySignatureInput('');
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const err: Record<string, string> = {};
      if (!form.identity_uuid?.trim()) err.identity_uuid = 'Identity UUID is required';
      else if (!isValidUuid(form.identity_uuid)) err.identity_uuid = 'Must be a valid UUID';
      if (!form.verifier_id?.trim()) err.verifier_id = 'Verifier ID is required';
      else if (!isValidUuid(form.verifier_id)) err.verifier_id = 'Must be a valid UUID';
      if (Object.keys(err).length > 0) {
        setErrors(err);
        return;
      }

      const payload: ChallengeRequest = {
        identity_uuid: form.identity_uuid.trim(),
        verifier_id: form.verifier_id.trim(),
        purpose: form.purpose,
      };
      if (form.device_id?.trim()) payload.device_id = form.device_id.trim();
      const loc: ChallengeLocation = {};
      if (form.lat?.trim()) loc.lat = parseFloat(form.lat);
      if (form.lng?.trim()) loc.lng = parseFloat(form.lng);
      if (form.facility_id?.trim()) loc.facility_id = form.facility_id.trim();
      if (form.location_ip?.trim()) loc.ip = form.location_ip.trim();
      if (Object.keys(loc).length > 0) payload.location = loc;

      setLoading(true);
      setSubmitError(null);
      setResult(null);
      TokenService.clear();
      setTokenExpired(false);
      setVerifyResult(null);
      setSecondsRemaining(null);
      try {
        const res = await requestChallenge(payload);
        setResult(res);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to request challenge.';
        const status = err && typeof err === 'object' && 'status' in err ? (err.status as number) : 0;
        if (status === 429) setSubmitError('Too many pending challenges (rate limit). Try again shortly.');
        else setSubmitError(message);
      } finally {
        setLoading(false);
      }
    },
    [form]
  );

  const inputBase =
    'input-focus mt-1 w-full rounded-xl border bg-[var(--byosync-gray-50)]/50 px-4 py-2.5 text-[var(--byosync-gray-900)] placeholder:text-[var(--byosync-gray-500)] transition hover:border-[var(--byosync-gray-300)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20 focus:border-[var(--byosync-blue)]';
  const inputError = 'border-red-400 focus:ring-red-200 focus:border-red-500';
  const inputOk = 'border-[var(--byosync-gray-200)]';

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="heading-page">Request challenge</h1>
        <p className="mt-3 subheading">
          Issue a cryptographic challenge nonce. Identity proves ownership by signing the challenge. Requires API Key with <code className="rounded bg-[var(--byosync-gray-100)] px-1 font-mono text-xs">auth:challenge</code>.
        </p>
      </div>  

      <form onSubmit={handleSubmit}>
        {submitError && (
          <div className="mb-6">
            <ErrorMessage title="Challenge request failed" onRetry={() => setSubmitError(null)}>
              {submitError}
            </ErrorMessage>
          </div>
        )}

        <FormSection
          title="Challenge parameters"
          description="Identity and verifier; purpose and optional location/device."
          icon="🔐"
          className="mb-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
                Identity UUID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.identity_uuid}
                onChange={(e) => update('identity_uuid', e.target.value)}
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
                value={form.verifier_id}
                onChange={(e) => update('verifier_id', e.target.value)}
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
              value={form.purpose}
              onChange={(e) => update('purpose', e.target.value)}
              className={`${inputBase} ${inputOk}`}
              disabled={loading}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/30 p-4">
            <p className="text-sm font-medium text-[var(--byosync-gray-700)]">Location (optional)</p>
            <p className="mt-0.5 text-xs text-[var(--byosync-gray-500)]">Captured at challenge time</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-[var(--byosync-gray-500)]">Lat</label>
                <input
                  type="text"
                  value={form.lat ?? ''}
                  onChange={(e) => update('lat', e.target.value)}
                  placeholder="e.g. 28.6139"
                  className={`${inputBase} py-2 text-sm ${inputOk}`}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--byosync-gray-500)]">Lng</label>
                <input
                  type="text"
                  value={form.lng ?? ''}
                  onChange={(e) => update('lng', e.target.value)}
                  placeholder="e.g. 77.2090"
                  className={`${inputBase} py-2 text-sm ${inputOk}`}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--byosync-gray-500)]">Facility ID</label>
                <input
                  type="text"
                  value={form.facility_id ?? ''}
                  onChange={(e) => update('facility_id', e.target.value)}
                  placeholder="UUID"
                  className={`${inputBase} py-2 font-mono text-sm ${inputOk}`}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--byosync-gray-500)]">IP</label>
                <input
                  type="text"
                  value={form.location_ip ?? ''}
                  onChange={(e) => update('location_ip', e.target.value)}
                  placeholder="e.g. 192.168.1.1"
                  className={`${inputBase} py-2 font-mono text-sm ${inputOk}`}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Device ID <span className="text-[var(--byosync-gray-500)]">(optional)</span>
            </label>
            <input
              type="text"
              value={form.device_id ?? ''}
              onChange={(e) => update('device_id', e.target.value)}
              placeholder="Device fingerprint — validated if binding enforced"
              className={`${inputBase} ${inputOk}`}
              disabled={loading}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/20 disabled:opacity-60 disabled:hover:transform-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner className="h-4 w-4" /> Requesting…
                </span>
              ) : (
                'Request challenge'
              )}
            </button>
          </div>
        </FormSection>
      </form>

      {result && (
        <>
          <FormSection
            title="Challenge issued"
            description="Nonce is single-use, 60s TTL. Sign challenge_string with your private key, then verify below."
            icon="✓"
            className="mb-8 border-emerald-200 bg-emerald-50/20"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                  Session: {result.session_id}
                </span>
                <span className="rounded-full bg-[var(--byosync-blue-pale)] px-3 py-1 text-sm font-medium text-[var(--byosync-blue)]">
                  {result.algorithm}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Expires at</p>
                <p className="mt-0.5 font-mono text-sm text-[var(--byosync-gray-900)]">
                  {formatExpiry(result.expires_at)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Instructions</p>
                <p className="mt-0.5 text-sm text-[var(--byosync-gray-700)]">{result.instructions}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Challenge string (sign this)</p>
                <div className="mt-1 rounded-xl border border-[var(--byosync-gray-200)] bg-white p-3 font-mono text-xs break-all text-[var(--byosync-gray-900)]">
                  {result.challenge_string}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Nonce (Base64)</p>
                <div className="mt-1 rounded-xl border border-[var(--byosync-gray-200)] bg-white p-3 font-mono text-xs break-all text-[var(--byosync-gray-700)]">
                  {result.nonce}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Story 2.2 — Verify signature */}
          <FormSection
            title="Verify signature"
            description="Submit the Base64 signature over challenge_string. Optional: current location at time of signing."
            icon="🔒"
            className="mb-8"
          >
            {verifyError && (
              <div className="mb-4">
                <ErrorMessage title="Verification failed" onRetry={() => setVerifyError(null)}>
                  {verifyError}
                </ErrorMessage>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
                Session ID
              </label>
              <input
                type="text"
                value={result.session_id}
                readOnly
                className="mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-100)]/50 px-4 py-2.5 font-mono text-sm text-[var(--byosync-gray-600)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
                Signature (Base64) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={verifySignatureInput}
                onChange={(e) => {
                  setVerifySignatureInput(e.target.value);
                  setVerifyError(null);
                }}
                placeholder="Paste Base64 signature of challenge_string"
                rows={3}
                className={`${inputBase} font-mono text-sm ${inputOk}`}
                disabled={verifyLoading}
              />
            </div>
            <div className="rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Location at signing (optional)</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--byosync-gray-500)]">Lat</label>
                  <input
                    type="text"
                    value={verifyLat}
                    onChange={(e) => setVerifyLat(e.target.value)}
                    placeholder="e.g. 28.6139"
                    className={`${inputBase} py-2 text-sm ${inputOk}`}
                    disabled={verifyLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--byosync-gray-500)]">Lng</label>
                  <input
                    type="text"
                    value={verifyLng}
                    onChange={(e) => setVerifyLng(e.target.value)}
                    placeholder="e.g. 77.2090"
                    className={`${inputBase} py-2 text-sm ${inputOk}`}
                    disabled={verifyLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--byosync-gray-500)]">Facility ID</label>
                  <input
                    type="text"
                    value={verifyFacilityId}
                    onChange={(e) => setVerifyFacilityId(e.target.value)}
                    placeholder="UUID"
                    className={`${inputBase} py-2 font-mono text-sm ${inputOk}`}
                    disabled={verifyLoading}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifyLoading || !verifySignatureInput.trim()}
                className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/20 disabled:opacity-50 disabled:hover:transform-none"
              >
                {verifyLoading ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner className="h-4 w-4" /> Verifying…
                  </span>
                ) : (
                  'Verify signature'
                )}
              </button>
            </div>
          </FormSection>

          {verifyResult && (
            <FormSection
              title={tokenExpired ? 'Session expired' : 'Verified Identity'}
              description={tokenExpired
                ? 'Assertion token has expired. Re-authenticate to continue.'
                : 'Assertion token (Story 2.3) stored in memory. Use for downstream verifier requests.'}
              icon={tokenExpired ? '🔄' : '✓'}
              className={tokenExpired
                ? 'border-amber-200 bg-amber-50/30'
                : 'verified-card border-emerald-200 bg-emerald-50/30'}
            >
              {tokenExpired ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-amber-800">
                    Session expired. Please verify again.
                  </p>
                  <p className="text-sm text-[var(--byosync-gray-600)]">
                    Re-authenticate to continue.
                  </p>
                  <button
                    type="button"
                    onClick={handleReAuth}
                    className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/20"
                  >
                    Re-authenticate
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="verified-badge inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800">
                      <span className="verified-check" aria-hidden>✓</span>
                      Verified for {verifyResult.purpose}
                    </span>
                    <span className="rounded-full bg-[var(--byosync-blue-pale)] px-3 py-1 text-sm font-medium text-[var(--byosync-blue)]">
                      {verifyResult.token_type} · {verifyResult.expires_in}s
                    </span>
                  </div>
                  <ul className="grid gap-2 text-sm text-[var(--byosync-gray-700)]">
                    <li>✅ Verified for {verifyResult.purpose}</li>
                    <li>📍 Facility: —</li>
                    <li>🕒 Valid for {secondsRemaining != null && secondsRemaining > 0
                      ? `${Math.floor(secondsRemaining / 60)} min ${secondsRemaining % 60}s`
                      : '5 minutes'}
                    </li>
                    <li>🔐 Secured by ByoSync</li>
                  </ul>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Identity</p>
                      <p className="mt-0.5 font-mono text-sm text-[var(--byosync-gray-900)]">{verifyResult.identity_uuid}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Verified at</p>
                      <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{verifyResult.verified_at}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--byosync-gray-200)] bg-white/80">
                    <button
                      type="button"
                      onClick={() => setTokenDetailsOpen((o) => !o)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--byosync-gray-700)] transition hover:bg-[var(--byosync-gray-50)]"
                    >
                      <span>Token details (decoded payload — display only)</span>
                      <span className="text-[var(--byosync-gray-500)] transition-transform duration-200" style={{ transform: tokenDetailsOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                    </button>
                    {tokenDetailsOpen && (
                      <div className="border-t border-[var(--byosync-gray-100)] px-4 py-3">
                        <DecodedPayloadDisplay token={verifyResult.assertion_token} />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Assertion token (stored in memory)</p>
                    <div className="mt-1 rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 p-3 font-mono text-xs text-[var(--byosync-gray-600)]">
                      {maskToken(verifyResult.assertion_token)}
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--byosync-gray-500)]">
                      Use <code className="rounded bg-[var(--byosync-gray-100)] px-1">Authorization: Bearer &lt;token&gt;</code> when calling verifier services.
                    </p>
                  </div>

                  <p className="text-xs text-[var(--byosync-gray-500)]">
                    Verifiers validate tokens via JWKS.{' '}
                    <Link to="/auth/jwks" className="font-medium text-[var(--byosync-blue)] hover:underline">View JWKS →</Link>
                  </p>
                </div>
              )}
            </FormSection>
          )}
        </>
      )}
    </div>
  );
}
