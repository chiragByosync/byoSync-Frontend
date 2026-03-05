import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  getIdentity,
  suspendIdentity,
  reactivateIdentity,
  revokeIdentity,
} from '../services/identityApi';
import type {
  IdentityMetadataResponse,
  IdentityStatus,
  IdentitySuspendRequest,
  IdentityRevokeRequest,
} from '../types/identity';
import { isValidUuid } from '../lib/validation';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { FormSection } from '../components/FormSection';

export function IdentityView() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const created = location.state?.created as { uuid: string } | undefined;
  const [data, setData] = useState<IdentityMetadataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [suspendForm, setSuspendForm] = useState<IdentitySuspendRequest>({
    reason: '',
    operator_id: '',
  });
  const [suspendDuration, setSuspendDuration] = useState<string>('');
  const [revokeForm, setRevokeForm] = useState<IdentityRevokeRequest>({
    reason: '',
    operator_id: '',
  });

  const fetchIdentity = useCallback(async () => {
    if (!uuid) {
      setError('No identity UUID in URL');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getIdentity(uuid);
      setData(res);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load identity.';
      const status =
        err && typeof err === 'object' && 'status' in err
          ? (err.status as number)
          : 0;
      if (status === 401)
        setError('Authentication required (JWT with identity:read).');
      else if (status === 404) setError('Identity not found.');
      else setError(message);
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    fetchIdentity();
  }, [fetchIdentity]);

  const handleSuspend = useCallback(async () => {
    if (!uuid || !suspendForm.reason.trim() || !suspendForm.operator_id.trim())
      return;
    if (!isValidUuid(suspendForm.operator_id)) {
      setActionError('Operator ID must be a valid UUID.');
      return;
    }
    setActionLoading('suspend');
    setActionError(null);
    try {
      await suspendIdentity(uuid, {
        ...suspendForm,
        duration_hours: suspendDuration ? parseInt(suspendDuration, 10) : undefined,
      });
      setSuspendOpen(false);
      setSuspendForm({ reason: '', operator_id: '' });
      setSuspendDuration('');
      await fetchIdentity();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to suspend identity.'
      );
    } finally {
      setActionLoading(null);
    }
  }, [uuid, suspendForm, suspendDuration, fetchIdentity]);

  const handleReactivate = useCallback(async () => {
    if (!uuid) return;
    setActionLoading('reactivate');
    setActionError(null);
    try {
      await reactivateIdentity(uuid);
      await fetchIdentity();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to reactivate identity.'
      );
    } finally {
      setActionLoading(null);
    }
  }, [uuid, fetchIdentity]);

  const handleRevoke = useCallback(async () => {
    if (!uuid || !revokeForm.reason.trim() || !revokeForm.operator_id.trim())
      return;
    if (!isValidUuid(revokeForm.operator_id)) {
      setActionError('Operator ID must be a valid UUID.');
      return;
    }
    setActionLoading('revoke');
    setActionError(null);
    try {
      await revokeIdentity(uuid, revokeForm);
      setRevokeOpen(false);
      setRevokeForm({ reason: '', operator_id: '' });
      await fetchIdentity();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to revoke identity.'
      );
    } finally {
      setActionLoading(null);
    }
  }, [uuid, revokeForm, fetchIdentity]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner className="h-10 w-10" />
        <p className="mt-4 text-[var(--byosync-gray-500)]">Loading identity…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl">
        <ErrorMessage title="Could not load identity" onRetry={fetchIdentity}>
          {error}
        </ErrorMessage>
        <button
          type="button"
          onClick={() => navigate('/identity')}
          className="btn-secondary mt-4 rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--byosync-gray-700)]"
        >
          Back to home
        </button>
      </div>
    );
  }

  if (!data) return null;

  const status: IdentityStatus = data.status;
  const canSuspend = status === 'ACTIVE';
  const canReactivate = status === 'SUSPENDED';
  const canRevoke = status === 'ACTIVE' || status === 'SUSPENDED';

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {created && (
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/50 p-5 text-emerald-800 shadow-[var(--shadow-card)]">
          <p className="font-semibold">Identity created successfully.</p>
          <p className="mt-1 text-sm opacity-90">UUID: {created.uuid}</p>
        </div>
      )}

      <div className="mb-10">
        <h1 className="heading-page">Identity</h1>
        <p className="mt-3 subheading">
          Metadata and lifecycle. No PII returned in plain text.
        </p>
      </div>

      {/* Metadata card */}
      <FormSection
        title="Details"
        description="Identity metadata"
        icon="◇"
        className="mb-8"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow label="UUID" value={data.uuid} mono />
          <div>
            <span className="text-sm font-medium text-[var(--byosync-gray-500)]">Status</span>
            <div className="mt-1">
              <StatusBadge status={data.status} />
            </div>
          </div>
          <InfoRow label="KYC level" value={data.kyc_level} />
          <InfoRow label="Sector" value={data.sector} />
          <InfoRow label="Created at" value={data.created_at} />
          {data.updated_at != null && (
            <InfoRow label="Updated at" value={data.updated_at} />
          )}
        </div>
        {(data.public_key_fingerprint != null ||
          data.verifier_id != null ||
          (data.facility_id != null && data.facility_id !== '')) && (
          <div className="mt-4 space-y-2 border-t border-[var(--byosync-gray-100)] pt-4">
            {data.public_key_fingerprint != null && (
              <InfoRow label="Public key fingerprint" value={data.public_key_fingerprint} mono />
            )}
            {data.verifier_id != null && (
              <InfoRow label="Verifier ID" value={data.verifier_id} mono />
            )}
            {data.facility_id != null && data.facility_id !== '' && (
              <InfoRow label="Facility ID" value={data.facility_id} mono />
            )}
          </div>
        )}
      </FormSection>

      {/* Lifecycle management */}
      <FormSection
        title="Lifecycle"
        description="Suspend, reactivate, or revoke. Requires JWT + Admin (identity:admin)."
        icon="◎"
        className="mb-8"
      >
        {actionError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {actionError}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {canSuspend && (
            <button
              type="button"
              onClick={() => setSuspendOpen(true)}
              disabled={!!actionLoading}
              className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:scale-[1.02] hover:bg-amber-100 hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
            >
              Suspend
            </button>
          )}
          {canReactivate && (
            <button
              type="button"
              onClick={handleReactivate}
              disabled={!!actionLoading}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-xl disabled:opacity-50 active:scale-[0.98]"
            >
              {actionLoading === 'reactivate' ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner className="h-4 w-4" /> Reactivating…
                </span>
              ) : (
                'Reactivate'
              )}
            </button>
          )}
          {canRevoke && (
            <button
              type="button"
              onClick={() => setRevokeOpen(true)}
              disabled={!!actionLoading}
              className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:scale-[1.02] hover:bg-red-100 hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
            >
              Revoke
            </button>
          )}
        </div>
        <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate(`/identity/${encodeURIComponent(data.uuid)}/history`)}
          className="rounded-lg px-2 py-1 text-sm font-medium text-[var(--byosync-blue)] transition hover:bg-[var(--byosync-blue-pale)] hover:scale-[1.02] active:scale-[0.98]"
        >
          View lifecycle history →
        </button>
        </div>
      </FormSection>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 border-t border-[var(--byosync-gray-200)] pt-8">
        <button
          type="button"
          onClick={() => navigate(`/identity/${encodeURIComponent(data.uuid)}/status`)}
          className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/20"
        >
          View status
        </button>
        <button
          type="button"
          onClick={() => navigate(`/identity/${encodeURIComponent(data.uuid)}/history`)}
          className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
        >
          View history
        </button>
        <button
          type="button"
          onClick={() => navigate(`/identity/${encodeURIComponent(data.uuid)}/keys`)}
          className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
        >
          Manage keys
        </button>
        <button
          type="button"
          onClick={() => navigate('/identity')}
          className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
        >
          Back to home
        </button>
      </div>

      {/* Suspend modal */}
      <Modal
        isOpen={suspendOpen}
        onClose={() => {
          setSuspendOpen(false);
          setActionError(null);
        }}
        title="Suspend identity"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={suspendForm.reason}
              onChange={(e) =>
                setSuspendForm((p) => ({ ...p, reason: e.target.value }))
              }
              rows={2}
              placeholder="Reason for suspension (logged in audit)"
              className="input-focus mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 text-sm transition hover:border-[var(--byosync-gray-300)] focus:border-[var(--byosync-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Auto-reactivate after (hours)
            </label>
            <input
              type="number"
              min={1}
              value={suspendDuration}
              onChange={(e) => setSuspendDuration(e.target.value)}
              placeholder="Leave empty for manual reactivation"
              className="input-focus mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 text-sm transition hover:border-[var(--byosync-gray-300)] focus:border-[var(--byosync-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Operator ID (UUID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={suspendForm.operator_id}
              onChange={(e) =>
                setSuspendForm((p) => ({ ...p, operator_id: e.target.value }))
              }
              placeholder="Admin operator UUID"
              className="input-focus mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 font-mono text-sm transition hover:border-[var(--byosync-gray-300)] focus:border-[var(--byosync-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSuspend}
              disabled={
                actionLoading === 'suspend' ||
                !suspendForm.reason.trim() ||
                !suspendForm.operator_id.trim()
              }
              className="rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white transition hover:scale-[1.02] hover:bg-amber-700 hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
            >
              {actionLoading === 'suspend' ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner className="h-4 w-4" /> Suspending…
                </span>
              ) : (
                'Suspend'
              )}
            </button>
            <button
              type="button"
              onClick={() => setSuspendOpen(false)}
              className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] px-4 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Revoke modal */}
      <Modal
        isOpen={revokeOpen}
        onClose={() => {
          setRevokeOpen(false);
          setActionError(null);
        }}
        title="Revoke identity"
      >
        <p className="mb-4 text-sm text-[var(--byosync-gray-600)]">
          This will permanently revoke the identity. This action cannot be undone.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={revokeForm.reason}
              onChange={(e) =>
                setRevokeForm((p) => ({ ...p, reason: e.target.value }))
              }
              rows={2}
              placeholder="Reason for revocation (logged in audit)"
              className="input-focus mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 text-sm transition hover:border-[var(--byosync-gray-300)] focus:border-[var(--byosync-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Operator ID (UUID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={revokeForm.operator_id}
              onChange={(e) =>
                setRevokeForm((p) => ({ ...p, operator_id: e.target.value }))
              }
              placeholder="Admin operator UUID"
              className="input-focus mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 font-mono text-sm transition hover:border-[var(--byosync-gray-300)] focus:border-[var(--byosync-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleRevoke}
              disabled={
                actionLoading === 'revoke' ||
                !revokeForm.reason.trim() ||
                !revokeForm.operator_id.trim()
              }
              className="rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:scale-[1.02] hover:bg-red-700 hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
            >
              {actionLoading === 'revoke' ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner className="h-4 w-4" /> Revoking…
                </span>
              ) : (
                'Revoke permanently'
              )}
            </button>
            <button
              type="button"
              onClick={() => setRevokeOpen(false)}
              className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] px-4 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-[var(--byosync-gray-500)]">
        {label}
      </span>
      <p
        className={`mt-0.5 text-sm font-medium text-[var(--byosync-gray-900)] ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </p>
    </div>
  );
}
