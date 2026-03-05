import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Copy, AlertTriangle } from 'lucide-react';
import {
  getVerifier,
  getVerifierUsage,
  updateVerifier,
  rotateVerifierApiKey,
} from '../services/verifierApi';
import type { VerifierProfile, VerifierUpdateRequest } from '../types/verifier';
import {
  VERIFIER_PURPOSES,
  VERIFIER_SCOPES,
} from '../types/verifier';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FormSection } from '../components/FormSection';
import { Modal } from '../components/Modal';

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function VerifierView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<VerifierProfile | null>(null);
  const [usage, setUsage] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageLoading, setUsageLoading] = useState(false);
  const [rotateOpen, setRotateOpen] = useState(false);
  const [rotateLoading, setRotateLoading] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<VerifierUpdateRequest>({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!id) {
      setError('No verifier ID in URL');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getVerifier(id);
      setProfile(res);
      setEditForm({
        org_name: res.org_name,
        contact_email: res.contact_email,
        allowed_purposes: res.allowed_purposes,
        allowed_scopes: res.allowed_scopes,
        webhook_url: res.webhook_url ?? '',
        ip_whitelist: res.ip_whitelist,
        rate_limit_per_min: res.rate_limit_per_min,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load verifier.';
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
      if (status === 401) setError('Authentication required (JWT with verifier:read).');
      else if (status === 404) setError('Verifier not found.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUsage = useCallback(async () => {
    if (!id) return;
    setUsageLoading(true);
    try {
      const res = await getVerifierUsage(id);
      setUsage(res as Record<string, unknown>);
    } catch {
      setUsage(null);
    } finally {
      setUsageLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile && id) fetchUsage();
  }, [profile, id, fetchUsage]);

  const handleRotate = useCallback(async () => {
    if (!id) return;
    setRotateLoading(true);
    setRotateError(null);
    setNewApiKey(null);
    try {
      const res = await rotateVerifierApiKey(id);
      setNewApiKey(res.api_key);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Key rotation failed.';
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
      if (status === 401) setRotateError('JWT with verifier:admin required.');
      else if (status === 403) setRotateError('Not authorized to rotate API key.');
      else setRotateError(msg);
    } finally {
      setRotateLoading(false);
    }
  }, [id]);

  const closeRotateModal = useCallback(() => {
    setRotateOpen(false);
    setRotateError(null);
    setNewApiKey(null);
  }, []);

  const copyNewKey = useCallback(() => {
    if (!newApiKey) return;
    navigator.clipboard.writeText(newApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [newApiKey]);

  const handleUpdate = useCallback(async () => {
    if (!id || !profile) return;
    const body: VerifierUpdateRequest = {};
    if (editForm.org_name !== undefined) body.org_name = editForm.org_name;
    if (editForm.contact_email !== undefined) body.contact_email = editForm.contact_email;
    if (editForm.allowed_purposes !== undefined) body.allowed_purposes = editForm.allowed_purposes;
    if (editForm.allowed_scopes !== undefined) body.allowed_scopes = editForm.allowed_scopes;
    if (editForm.webhook_url !== undefined) body.webhook_url = editForm.webhook_url || undefined;
    if (editForm.ip_whitelist !== undefined) body.ip_whitelist = editForm.ip_whitelist;
    if (editForm.rate_limit_per_min !== undefined) body.rate_limit_per_min = editForm.rate_limit_per_min;
    if (Object.keys(body).length === 0) {
      setEditMode(false);
      return;
    }
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const updated = await updateVerifier(id, body);
      setProfile(updated);
      setEditForm({
        org_name: updated.org_name,
        contact_email: updated.contact_email,
        allowed_purposes: updated.allowed_purposes,
        allowed_scopes: updated.allowed_scopes,
        webhook_url: updated.webhook_url ?? '',
        ip_whitelist: updated.ip_whitelist,
        rate_limit_per_min: updated.rate_limit_per_min,
      });
      setEditMode(false);
    } catch (err: unknown) {
      setUpdateError(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setUpdateLoading(false);
    }
  }, [id, profile, editForm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner className="h-10 w-10" />
        <p className="mt-4 text-[var(--byosync-gray-500)]">Loading verifier…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorMessage title="Could not load verifier" onRetry={() => { setError(null); fetchProfile(); }}>
          {error ?? 'Not found'}
        </ErrorMessage>
        <button
          type="button"
          onClick={() => navigate('/verifier')}
          className="mt-6 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--byosync-blue)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Verifier
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-page">{profile.org_name}</h1>
          <p className="mt-1 font-mono text-sm text-[var(--byosync-gray-500)]">{profile.verifier_id}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/verifier')}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--byosync-blue)] transition hover:bg-[var(--byosync-blue-pale)]"
        >
          <ArrowLeft className="h-4 w-4" /> Verifier home
        </button>
      </div>

      <FormSection
        title="Profile"
        description="Organization and permissions"
        icon={<span className="text-lg">◇</span>}
      >
        {!editMode ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Organization</p>
                <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{profile.org_name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Sector</p>
                <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{profile.sector}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Contact email</p>
                <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{profile.contact_email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Trust tier</p>
                <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{profile.trust_tier}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Allowed purposes</p>
              <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{profile.allowed_purposes.join(', ')}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Allowed scopes</p>
              <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{profile.allowed_scopes.join(', ')}</p>
            </div>
            {(profile.webhook_url || (profile.ip_whitelist && profile.ip_whitelist.length > 0)) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.webhook_url && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Webhook URL</p>
                    <p className="mt-0.5 break-all font-mono text-sm text-[var(--byosync-gray-900)]">{profile.webhook_url}</p>
                  </div>
                )}
                {profile.ip_whitelist && profile.ip_whitelist.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">IP whitelist</p>
                    <p className="mt-0.5 font-mono text-sm text-[var(--byosync-gray-900)]">{profile.ip_whitelist.join(', ')}</p>
                  </div>
                )}
              </div>
            )}
            {profile.rate_limit_per_min != null && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Rate limit per minute</p>
                <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{profile.rate_limit_per_min}</p>
              </div>
            )}
            {profile.jwks_url && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">JWKS URL</p>
                <p className="mt-0.5 break-all font-mono text-sm text-[var(--byosync-gray-900)]">{profile.jwks_url}</p>
              </div>
            )}
            {(profile.created_at || profile.updated_at) && (
              <div className="flex flex-wrap gap-6 pt-2 text-xs text-[var(--byosync-gray-500)]">
                {profile.created_at && <span>Created: {formatDate(profile.created_at)}</span>}
                {profile.updated_at && <span>Updated: {formatDate(profile.updated_at)}</span>}
              </div>
            )}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--byosync-gray-700)] transition hover:border-[var(--byosync-blue)] hover:text-[var(--byosync-blue)]"
              >
                Edit settings
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {updateError && (
              <p className="text-sm text-red-600">{updateError}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">Organization name</label>
              <input
                type="text"
                value={editForm.org_name ?? ''}
                onChange={(e) => setEditForm((p) => ({ ...p, org_name: e.target.value }))}
                className="input-focus mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">Contact email</label>
              <input
                type="email"
                value={editForm.contact_email ?? ''}
                onChange={(e) => setEditForm((p) => ({ ...p, contact_email: e.target.value }))}
                className="input-focus mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">Webhook URL</label>
              <input
                type="url"
                value={editForm.webhook_url ?? ''}
                onChange={(e) => setEditForm((p) => ({ ...p, webhook_url: e.target.value }))}
                className="input-focus mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">Allowed purposes</label>
              <p className="mt-1 text-xs text-[var(--byosync-gray-500)]">Select from list (edit in backend if needed)</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {VERIFIER_PURPOSES.map((p) => {
                  const selected = (editForm.allowed_purposes ?? []).includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          allowed_purposes: selected
                            ? (prev.allowed_purposes ?? []).filter((x) => x !== p)
                            : [...(prev.allowed_purposes ?? []), p],
                        }))
                      }
                      className={`rounded-lg border px-3 py-1.5 text-sm ${
                        selected
                          ? 'border-[var(--byosync-blue)] bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)]'
                          : 'border-[var(--byosync-gray-200)] bg-white text-[var(--byosync-gray-600)]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">Allowed scopes</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {VERIFIER_SCOPES.map((s) => {
                  const selected = (editForm.allowed_scopes ?? []).includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          allowed_scopes: selected
                            ? (prev.allowed_scopes ?? []).filter((x) => x !== s)
                            : [...(prev.allowed_scopes ?? []), s],
                        }))
                      }
                      className={`rounded-lg border px-3 py-1.5 text-sm ${
                        selected
                          ? 'border-[var(--byosync-blue)] bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)]'
                          : 'border-[var(--byosync-gray-200)] bg-white text-[var(--byosync-gray-600)]'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={updateLoading}
                className="flex items-center gap-2 rounded-xl bg-[var(--byosync-blue)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {updateLoading && <LoadingSpinner className="h-4 w-4" />} Save
              </button>
              <button
                type="button"
                onClick={() => { setEditMode(false); setUpdateError(null); }}
                className="rounded-xl border-2 border-[var(--byosync-gray-200)] px-4 py-2.5 text-sm font-semibold text-[var(--byosync-gray-700)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </FormSection>

      <FormSection
        title="API key"
        description="Rotate key if compromised. New key shown only once."
        className="mt-8"
      >
        <button
          type="button"
          onClick={() => { setRotateError(null); setNewApiKey(null); setRotateOpen(true); }}
          className="flex items-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50/80 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-50"
        >
          <RefreshCw className="h-4 w-4" /> Rotate API key
        </button>
      </FormSection>

      <FormSection
        title="Usage"
        description="API usage statistics (verifier:read)"
        className="mt-8"
      >
        {usageLoading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--byosync-gray-500)]">
            <LoadingSpinner className="h-4 w-4" /> Loading…
          </div>
        ) : usage && Object.keys(usage).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(usage)
              .filter(([k]) => k !== 'verifier_id')
              .map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-[var(--byosync-gray-100)] py-2">
                  <span className="text-sm font-medium text-[var(--byosync-gray-600)]">{key.replace(/_/g, ' ')}</span>
                  <span className="text-sm text-[var(--byosync-gray-900)]">
                    {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--byosync-gray-500)]">No usage data available.</p>
        )}
      </FormSection>

      <Modal
        isOpen={rotateOpen}
        onClose={closeRotateModal}
        title={newApiKey ? 'New API key' : 'Rotate API key'}
      >
        {!newApiKey ? (
          <>
            <p className="mb-4 text-sm text-[var(--byosync-gray-600)]">
              Generate a new API key. The current key will stop working. Store the new key securely — it is shown only once.
            </p>
            {rotateError && <p className="mb-3 text-sm text-red-600">{rotateError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRotate}
                disabled={rotateLoading}
                className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {rotateLoading && <LoadingSpinner className="h-4 w-4" />} Rotate
              </button>
              <button
                type="button"
                onClick={closeRotateModal}
                className="rounded-xl border-2 border-[var(--byosync-gray-200)] px-4 py-2.5 text-sm font-semibold text-[var(--byosync-gray-700)]"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">Copy this key now. It cannot be retrieved again.</p>
              </div>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <code className="flex-1 break-all rounded-lg bg-[var(--byosync-gray-100)] px-3 py-2 font-mono text-sm">
                {newApiKey}
              </code>
              <button
                type="button"
                onClick={copyNewKey}
                className="flex shrink-0 items-center gap-2 rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--byosync-gray-700)] hover:border-[var(--byosync-blue)] hover:text-[var(--byosync-blue)]"
              >
                <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button
              type="button"
              onClick={closeRotateModal}
              className="rounded-xl bg-[var(--byosync-blue)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Done
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}
