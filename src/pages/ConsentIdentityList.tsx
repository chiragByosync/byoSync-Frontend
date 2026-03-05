import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { List, ArrowLeft, User, Ban } from 'lucide-react';
import { listActiveConsents, revokeConsent, revokeAllConsents } from '../services/consentApi';
import type { ConsentListItem } from '../types/consent';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FormSection } from '../components/FormSection';
import { Modal } from '../components/Modal';
import { isValidUuid } from '../lib/validation';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function ConsentIdentityList() {
  const navigate = useNavigate();
  const [identityUuid, setIdentityUuid] = useState('');
  const [consents, setConsents] = useState<ConsentListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [revokeSingleId, setRevokeSingleId] = useState<string | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    const uuid = identityUuid.trim();
    if (!uuid) return;
    if (!isValidUuid(uuid)) {
      setError('Enter a valid identity UUID.');
      return;
    }
    setLoading(true);
    setError(null);
    setConsents([]);
    setSearched(true);
    try {
      const res = await listActiveConsents(uuid);
      setConsents(res.consents ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load consents.';
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
      if (status === 401) setError('Authentication required (JWT with consent:read).');
      else if (status === 404) setError('Identity not found or no consents.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }, [identityUuid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchList();
  };

  const handleRevokeSingle = useCallback(async () => {
    if (!revokeSingleId) return;
    setRevokeLoading(true);
    setRevokeError(null);
    try {
      await revokeConsent(revokeSingleId, revokeReason.trim() ? { revoke_reason: revokeReason.trim() } : undefined);
      setRevokeSingleId(null);
      setRevokeReason('');
      await fetchList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Revoke failed.';
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
      if (status === 401) setRevokeError('Authentication required (JWT with consent:revoke).');
      else if (status === 403) setRevokeError('You are not allowed to revoke this consent.');
      else setRevokeError(msg);
    } finally {
      setRevokeLoading(false);
    }
  }, [revokeSingleId, revokeReason, fetchList]);

  const handleRevokeAll = useCallback(async () => {
    const uuid = identityUuid.trim();
    if (!uuid) return;
    setRevokeLoading(true);
    setRevokeError(null);
    try {
      await revokeAllConsents(uuid, revokeReason.trim() ? { revoke_reason: revokeReason.trim() } : undefined);
      setRevokeAllOpen(false);
      setRevokeReason('');
      await fetchList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Revoke all failed.';
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
      if (status === 401) setRevokeError('Authentication required (JWT with consent:revoke).');
      else if (status === 403) setRevokeError('You are not allowed to revoke consents for this identity.');
      else setRevokeError(msg);
    } finally {
      setRevokeLoading(false);
    }
  }, [identityUuid, revokeReason, fetchList]);

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="heading-page">Active consents by identity</h1>
        <p className="mt-3 subheading">
          List all active consents for an identity. Requires JWT with consent:read.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
        className="card-hover mt-10 rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Identity UUID
            </label>
            <input
              type="text"
              value={identityUuid}
              onChange={(e) => setIdentityUuid(e.target.value)}
              placeholder="e.g. byos_7f3a9c2d-..."
              className="input-focus mt-1.5 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-4 py-3 font-mono text-sm transition placeholder:text-[var(--byosync-gray-500)] focus:border-[var(--byosync-blue)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !identityUuid.trim()}
            className="btn-primary flex items-center gap-2 rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
            List active consents
          </button>
        </form>
      </motion.div>

      {error && (
        <div className="mt-6">
          <ErrorMessage title="Could not load consents" onRetry={() => setError(null)}>
            {error}
          </ErrorMessage>
        </div>
      )}

      {searched && !loading && !error && (
        <FormSection
          title="Active consents"
          description={consents.length === 0 ? 'No active consents for this identity.' : `${consents.length} consent(s) found.`}
          icon={<User className="h-5 w-5" strokeWidth={2} />}
          className="mt-8"
        >
          {consents.length === 0 ? (
            <p className="text-sm text-[var(--byosync-gray-500)]">No active consents recorded.</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-[var(--byosync-gray-600)]">{consents.length} consent(s)</span>
                <button
                  type="button"
                  onClick={() => { setRevokeError(null); setRevokeReason(''); setRevokeAllOpen(true); }}
                  className="btn-secondary flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50/80 px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
                >
                  <Ban className="h-4 w-4" /> Revoke all for this identity
                </button>
              </div>
              <ul className="space-y-4">
                {consents.map((c) => (
                  <li
                    key={c.consent_id}
                    className="rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/40 p-4 transition hover:border-[var(--byosync-gray-300)] hover:bg-[var(--byosync-gray-50)]/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-sm font-medium text-[var(--byosync-gray-900)]">{c.consent_id}</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">{c.status}</span>
                        <button
                          type="button"
                          onClick={() => { setRevokeError(null); setRevokeSingleId(c.consent_id); setRevokeReason(''); }}
                          className="rounded-lg border border-red-200 bg-red-50/80 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 grid gap-1 text-sm text-[var(--byosync-gray-600)] sm:grid-cols-2">
                      <span>Purpose: {c.purpose}</span>
                      <span>Verifier: <span className="font-mono text-xs">{c.verifier_id.slice(0, 20)}…</span></span>
                      <span>Valid until: {formatDate(c.valid_until)}</span>
                      <span>Scope: {c.data_scope.join(', ')}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </FormSection>
      )}

      <Modal
        isOpen={!!revokeSingleId}
        onClose={() => { setRevokeSingleId(null); setRevokeError(null); }}
        title="Revoke consent"
      >
        <p className="mb-4 text-sm text-[var(--byosync-gray-600)]">
          This will revoke the selected consent immediately. The verifier will no longer be able to use it.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">Reason (optional, for audit)</label>
          <textarea
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            placeholder="e.g. User requested revocation"
            rows={2}
            className="input-focus mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 text-sm"
          />
        </div>
        {revokeError && <p className="mb-3 text-sm text-red-600">{revokeError}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRevokeSingle}
            disabled={revokeLoading}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {revokeLoading && <LoadingSpinner className="h-4 w-4 shrink-0" />}
            {revokeLoading ? 'Revoking…' : 'Revoke'}
          </button>
          <button
            type="button"
            onClick={() => setRevokeSingleId(null)}
            className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] px-4 py-2.5 text-sm font-semibold text-[var(--byosync-gray-700)]"
          >
            Cancel
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={revokeAllOpen}
        onClose={() => { setRevokeAllOpen(false); setRevokeError(null); }}
        title="Revoke all consents for this identity"
      >
        <p className="mb-4 text-sm text-[var(--byosync-gray-600)]">
          This will revoke all active consents for identity <span className="font-mono text-xs">{identityUuid.trim().slice(0, 24)}…</span>. Verifiers will no longer be able to use them.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">Reason (optional, for audit)</label>
          <textarea
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            placeholder="e.g. User requested full revocation"
            rows={2}
            className="input-focus mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 text-sm"
          />
        </div>
        {revokeError && <p className="mb-3 text-sm text-red-600">{revokeError}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRevokeAll}
            disabled={revokeLoading}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {revokeLoading && <LoadingSpinner className="h-4 w-4 shrink-0" />}
            {revokeLoading ? 'Revoking…' : 'Revoke all'}
          </button>
          <button
            type="button"
            onClick={() => setRevokeAllOpen(false)}
            className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] px-4 py-2.5 text-sm font-semibold text-[var(--byosync-gray-700)]"
          >
            Cancel
          </button>
        </div>
      </Modal>

      <motion.button
        type="button"
        onClick={() => navigate('/consent')}
        className="mt-8 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--byosync-blue)] transition-all duration-300 hover:bg-[var(--byosync-blue-pale)] hover:-translate-y-0.5 active:scale-[0.98]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Consent
      </motion.button>
    </div>
  );
}
