import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, FileText, Ban } from 'lucide-react';
import { getConsent, revokeConsent } from '../services/consentApi';
import type { ConsentDetailResponse } from '../types/consent';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FormSection } from '../components/FormSection';
import { Modal } from '../components/Modal';

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

export function ConsentLookup() {
  const navigate = useNavigate();
  const [consentId, setConsentId] = useState('');
  const [data, setData] = useState<ConsentDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const fetchConsent = useCallback(async () => {
    const id = consentId.trim();
    if (!id) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await getConsent(id);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load consent.';
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
      if (status === 401) setError('Authentication required (JWT with consent:read).');
      else if (status === 404) setError('Consent not found.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }, [consentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchConsent();
  };

  const handleRevoke = useCallback(async () => {
    if (!data?.consent_id) return;
    setRevokeLoading(true);
    setRevokeError(null);
    try {
      await revokeConsent(data.consent_id, revokeReason.trim() ? { revoke_reason: revokeReason.trim() } : undefined);
      setRevokeOpen(false);
      setRevokeReason('');
      await fetchConsent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Revoke failed.';
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
      if (status === 401) setRevokeError('Authentication required (JWT with consent:revoke).');
      else if (status === 403) setRevokeError('You are not allowed to revoke this consent.');
      else setRevokeError(msg);
    } finally {
      setRevokeLoading(false);
    }
  }, [data?.consent_id, revokeReason, fetchConsent]);

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="heading-page">Get consent details</h1>
        <p className="mt-3 subheading">Fetch a consent record by ID. Requires JWT with consent:read.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
        className="card-hover mt-10 rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">Consent ID</label>
            <input
              type="text"
              value={consentId}
              onChange={(e) => setConsentId(e.target.value)}
              placeholder="e.g. con_e5f6g7h8..."
              className="input-focus mt-1.5 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-4 py-3 font-mono text-sm transition placeholder:text-[var(--byosync-gray-500)] focus:border-[var(--byosync-blue)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !consentId.trim()}
            className="btn-primary flex items-center gap-2 rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {loading ? <LoadingSpinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            Get consent
          </button>
        </form>
      </motion.div>

      {error && (
        <div className="mt-6">
          <ErrorMessage title="Could not load consent" onRetry={() => setError(null)}>
            {error}
          </ErrorMessage>
        </div>
      )}

      {data && (
        <FormSection
          title="Consent details"
          description="Full consent record."
          icon={<FileText className="h-5 w-5" strokeWidth={2} />}
          className="mt-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Consent ID</p>
              <p className="mt-0.5 font-mono text-sm text-[var(--byosync-gray-900)]">{data.consent_id}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Status</p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--byosync-gray-900)]">{data.status}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Identity UUID</p>
              <p className="mt-0.5 font-mono text-sm text-[var(--byosync-gray-900)]">{data.identity_uuid}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Verifier ID</p>
              <p className="mt-0.5 font-mono text-sm text-[var(--byosync-gray-900)]">{data.verifier_id}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Purpose</p>
              <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{data.purpose}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Data scope</p>
              <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{data.data_scope.join(', ')}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Valid from</p>
              <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{formatDate(data.valid_from)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Valid until</p>
              <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">{formatDate(data.valid_until)}</p>
            </div>
          </div>
          {(data.revoked_at ?? data.revoke_reason) && (
            <div className="mt-4 border-t border-[var(--byosync-gray-200)] pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--byosync-gray-500)]">Revocation</p>
              {data.revoked_at && <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">At: {formatDate(data.revoked_at)}</p>}
              {data.revoke_reason && <p className="mt-0.5 text-sm text-[var(--byosync-gray-900)]">Reason: {data.revoke_reason}</p>}
            </div>
          )}
          {data.status === 'ACTIVE' && (
            <div className="mt-6 border-t border-[var(--byosync-gray-200)] pt-4">
              <button
                type="button"
                onClick={() => { setRevokeError(null); setRevokeOpen(true); }}
                className="btn-secondary flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50/80 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
              >
                <Ban className="h-4 w-4" /> Revoke consent
              </button>
            </div>
          )}
        </FormSection>
      )}

      <Modal
        isOpen={revokeOpen}
        onClose={() => { setRevokeOpen(false); setRevokeError(null); }}
        title="Revoke consent"
      >
        <p className="mb-4 text-sm text-[var(--byosync-gray-600)]">
          This will revoke the consent immediately. The verifier will no longer be able to access data under this consent.
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
            onClick={handleRevoke}
            disabled={revokeLoading}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {revokeLoading && <LoadingSpinner className="h-4 w-4 shrink-0" />}
            {revokeLoading ? 'Revoking…' : 'Revoke'}
          </button>
          <button
            type="button"
            onClick={() => setRevokeOpen(false)}
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
