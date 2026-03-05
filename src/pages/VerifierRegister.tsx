import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, AlertTriangle } from 'lucide-react';
import { registerVerifier } from '../services/verifierApi';
import type {
  VerifierRegisterRequest,
  VerifierSector,
  TrustTier,
  VerifierPurpose,
  VerifierScope,
} from '../types/verifier';
import {
  VERIFIER_SECTORS,
  TRUST_TIERS,
  VERIFIER_PURPOSES,
  VERIFIER_SCOPES,
} from '../types/verifier';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FormSection } from '../components/FormSection';

const inputBase =
  'input-focus mt-1 w-full rounded-xl border bg-[var(--byosync-gray-50)]/50 px-4 py-2.5 text-[var(--byosync-gray-900)] placeholder:text-[var(--byosync-gray-500)] transition hover:border-[var(--byosync-gray-300)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20 focus:border-[var(--byosync-blue)]';
const inputError = 'border-red-400 focus:ring-red-200 focus:border-red-500';
const inputOk = 'border-[var(--byosync-gray-200)]';

function toggleArray<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function VerifierRegister() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('');
  const [sector, setSector] = useState<VerifierSector>('BFSI');
  const [contactEmail, setContactEmail] = useState('');
  const [allowedPurposes, setAllowedPurposes] = useState<VerifierPurpose[]>([]);
  const [allowedScopes, setAllowedScopes] = useState<VerifierScope[]>([]);
  const [trustTier, setTrustTier] = useState<TrustTier>('STANDARD');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [ipWhitelistStr, setIpWhitelistStr] = useState('');
  const [rateLimitPerMin, setRateLimitPerMin] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    verifier_id: string;
    api_key: string;
    trust_tier: TrustTier;
    allowed_purposes: VerifierPurpose[];
    rate_limit_per_min: number;
    jwks_url?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const togglePurpose = useCallback((p: VerifierPurpose) => {
    setAllowedPurposes((prev) => toggleArray(prev, p));
  }, []);
  const toggleScope = useCallback((s: VerifierScope) => {
    setAllowedScopes((prev) => toggleArray(prev, s));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!orgName.trim()) {
        setSubmitError('Organization name is required.');
        return;
      }
      if (!contactEmail.trim()) {
        setSubmitError('Contact email is required.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail.trim())) {
        setSubmitError('Enter a valid email address.');
        return;
      }
      if (allowedPurposes.length === 0) {
        setSubmitError('Select at least one allowed purpose.');
        return;
      }
      if (allowedScopes.length === 0) {
        setSubmitError('Select at least one allowed scope.');
        return;
      }

      const body: VerifierRegisterRequest = {
        org_name: orgName.trim(),
        sector,
        contact_email: contactEmail.trim(),
        allowed_purposes: allowedPurposes,
        allowed_scopes: allowedScopes,
        trust_tier: trustTier,
      };
      if (webhookUrl.trim()) body.webhook_url = webhookUrl.trim();
      const ipList = ipWhitelistStr
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (ipList.length > 0) body.ip_whitelist = ipList;
      const rate = parseInt(rateLimitPerMin, 10);
      if (!Number.isNaN(rate) && rate > 0) body.rate_limit_per_min = rate;

      setLoading(true);
      setSubmitError(null);
      try {
        const res = await registerVerifier(body);
        setSuccess({
          verifier_id: res.verifier_id,
          api_key: res.api_key,
          trust_tier: res.trust_tier,
          allowed_purposes: res.allowed_purposes,
          rate_limit_per_min: res.rate_limit_per_min,
          jwks_url: res.jwks_url,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed.';
        const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
        if (status === 401) setSubmitError('Master API Key required (verifier:admin).');
        else if (status === 403) setSubmitError('Not authorized to register verifiers.');
        else setSubmitError(msg);
      } finally {
        setLoading(false);
      }
    },
    [
      orgName,
      sector,
      contactEmail,
      allowedPurposes,
      allowedScopes,
      trustTier,
      webhookUrl,
      ipWhitelistStr,
      rateLimitPerMin,
    ]
  );

  const copyApiKey = useCallback(() => {
    if (!success?.api_key) return;
    navigator.clipboard.writeText(success.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [success?.api_key]);

  if (success) {
    return (
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm sm:p-8"
        >
          <h1 className="heading-page text-emerald-800">Verifier registered</h1>
          <p className="mt-2 text-sm text-[var(--byosync-gray-600)]">
            Store the API key securely. It cannot be retrieved again.
          </p>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">API key shown only once</p>
                <p className="mt-1 text-sm text-amber-700">
                  Copy this key now. The backend stores only a hash; you will not be able to see it again. If lost, rotate the key from the verifier profile.
                </p>
              </div>
            </div>
          </div>

          <FormSection title="Verifier details" className="mt-6" description="">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Verifier ID</p>
                <p className="mt-0.5 font-mono text-sm text-[var(--byosync-gray-900)]">{success.verifier_id}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">API key</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 break-all rounded-lg bg-[var(--byosync-gray-100)] px-3 py-2 font-mono text-sm text-[var(--byosync-gray-900)]">
                    {success.api_key}
                  </code>
                  <button
                    type="button"
                    onClick={copyApiKey}
                    className="flex shrink-0 items-center gap-2 rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--byosync-gray-700)] transition hover:border-[var(--byosync-blue)] hover:text-[var(--byosync-blue)]"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Trust tier</p>
                  <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{success.trust_tier}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Rate limit/min</p>
                  <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{success.rate_limit_per_min}</p>
                </div>
              </div>
              {success.allowed_purposes.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Allowed purposes</p>
                  <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{success.allowed_purposes.join(', ')}</p>
                </div>
              )}
              {success.jwks_url && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">JWKS URL</p>
                  <p className="mt-0.5 break-all font-mono text-sm text-[var(--byosync-gray-900)]">{success.jwks_url}</p>
                </div>
              )}
            </div>
          </FormSection>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/verifier/${encodeURIComponent(success.verifier_id)}`)}
              className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white transition hover:bg-[var(--byosync-blue-dark)]"
            >
              View verifier profile
            </button>
            <button
              type="button"
              onClick={() => navigate('/verifier')}
              className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
            >
              Back to Verifier
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="heading-page">Register verifier</h1>
        <p className="mt-3 subheading">
          Create a new verifier organization. Requires Master API Key with verifier:admin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {submitError && (
          <ErrorMessage title="Registration failed" onRetry={() => setSubmitError(null)}>
            {submitError}
          </ErrorMessage>
        )}

        <FormSection
          title="Organization"
          description="Legal name, sector, and contact"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Organization name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => { setOrgName(e.target.value); setSubmitError(null); }}
              placeholder="Legal name of the organization"
              className={`${inputBase} ${inputOk}`}
              disabled={loading}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
                Sector <span className="text-red-500">*</span>
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as VerifierSector)}
                className={`${inputBase} ${inputOk}`}
                disabled={loading}
              >
                {VERIFIER_SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
                Contact email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => { setContactEmail(e.target.value); setSubmitError(null); }}
                placeholder="Technical contact"
                className={`${inputBase} ${inputOk}`}
                disabled={loading}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Trust & limits"
          description="Trust tier affects rate limits and scope permissions"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Trust tier <span className="text-red-500">*</span>
            </label>
            <select
              value={trustTier}
              onChange={(e) => setTrustTier(e.target.value as TrustTier)}
              className={`${inputBase} ${inputOk}`}
              disabled={loading}
            >
              {TRUST_TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Rate limit per minute <span className="text-[var(--byosync-gray-500)]">(optional)</span>
            </label>
            <input
              type="number"
              min={1}
              value={rateLimitPerMin}
              onChange={(e) => setRateLimitPerMin(e.target.value)}
              placeholder="Defaults by trust tier"
              className={`${inputBase} ${inputOk}`}
              disabled={loading}
            />
          </div>
        </FormSection>

        <FormSection
          title="Allowed purposes"
          description="Subset of purposes this verifier can request"
        >
          <p className="text-sm text-[var(--byosync-gray-500)]">Select at least one.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {VERIFIER_PURPOSES.map((p) => (
              <label
                key={p}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--byosync-gray-200)] bg-white px-4 py-2.5 text-sm transition hover:border-[var(--byosync-blue)] has-[:checked]:border-[var(--byosync-blue)] has-[:checked]:bg-[var(--byosync-blue-pale)]"
              >
                <input
                  type="checkbox"
                  checked={allowedPurposes.includes(p)}
                  onChange={() => togglePurpose(p)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-[var(--byosync-gray-300)] text-[var(--byosync-blue)] focus:ring-[var(--byosync-blue)]"
                />
                <span>{p}</span>
              </label>
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Allowed scopes"
          description="Data fields this verifier can request"
        >
          <p className="text-sm text-[var(--byosync-gray-500)]">Select at least one.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {VERIFIER_SCOPES.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--byosync-gray-200)] bg-white px-4 py-2.5 text-sm transition hover:border-[var(--byosync-blue)] has-[:checked]:border-[var(--byosync-blue)] has-[:checked]:bg-[var(--byosync-blue-pale)]"
              >
                <input
                  type="checkbox"
                  checked={allowedScopes.includes(s)}
                  onChange={() => toggleScope(s)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-[var(--byosync-gray-300)] text-[var(--byosync-blue)] focus:ring-[var(--byosync-blue)]"
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Optional settings"
          description="Webhook and IP whitelist"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://..."
              className={`${inputBase} ${inputOk}`}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">IP whitelist</label>
            <textarea
              value={ipWhitelistStr}
              onChange={(e) => setIpWhitelistStr(e.target.value)}
              placeholder="One IP or CIDR per line, or comma-separated"
              rows={3}
              className={`${inputBase} ${inputOk} font-mono text-sm`}
              disabled={loading}
            />
          </div>
        </FormSection>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {loading ? <LoadingSpinner className="h-4 w-4" /> : null}
            Register verifier
          </button>
          <button
            type="button"
            onClick={() => navigate('/verifier')}
            className="btn-secondary flex items-center gap-2 rounded-xl border-2 border-[var(--byosync-gray-200)] px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </form>
    </div>
  );
}
