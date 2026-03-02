import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getIdentityStatus,
  suspendIdentity,
  reactivateIdentity,
  revokeIdentity,
} from '../services/identityApi';
import type {
  IdentityStatusResponse,
  IdentityStatus,
  IdentitySuspendRequest,
  IdentityRevokeRequest,
} from '../types/identity';
import { isValidUuid } from '../lib/validation';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';

export function IdentityStatus() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<IdentityStatusResponse | null>(null);
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

  const fetchStatus = useCallback(async () => {
    if (!uuid) {
      setError('No identity UUID in URL');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getIdentityStatus(uuid);
      setData(res);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load status.';
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
    fetchStatus();
  }, [fetchStatus]);

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
      await fetchStatus();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to suspend identity.'
      );
    } finally {
      setActionLoading(null);
    }
  }, [uuid, suspendForm, suspendDuration, fetchStatus]);

  const handleReactivate = useCallback(async () => {
    if (!uuid) return;
    setActionLoading('reactivate');
    setActionError(null);
    try {
      await reactivateIdentity(uuid);
      await fetchStatus();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to reactivate identity.'
      );
    } finally {
      setActionLoading(null);
    }
  }, [uuid, fetchStatus]);

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
      await fetchStatus();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to revoke identity.'
      );
    } finally {
      setActionLoading(null);
    }
  }, [uuid, revokeForm, fetchStatus]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner className="h-10 w-10" />
        <p className="mt-4 text-[var(--byosync-gray-500)]">Loading status…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl">
        <ErrorMessage title="Could not load status" onRetry={fetchStatus}>
          {error}
        </ErrorMessage>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--byosync-gray-700)] hover:bg-[var(--byosync-gray-50)]"
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
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--byosync-gray-900)]">
          Identity Status
        </h1>
        <p className="mt-2 text-[var(--byosync-gray-500)]">
          Current lifecycle status and actions.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--byosync-gray-200)] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--byosync-gray-500)]">UUID</p>
            <p className="mt-1 font-mono text-sm font-medium text-[var(--byosync-gray-900)]">
              {data.uuid}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--byosync-gray-500)]">Status</p>
            <div className="mt-1">
              <StatusBadge status={data.status} />
            </div>
          </div>
          {data.updated_at != null && (
            <div>
              <p className="text-sm font-medium text-[var(--byosync-gray-500)]">Updated at</p>
              <p className="mt-1 text-sm font-medium text-[var(--byosync-gray-900)]">
                {data.updated_at}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lifecycle actions */}
      <div className="mt-8 rounded-2xl border border-[var(--byosync-gray-200)] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--byosync-gray-900)]">
          Lifecycle actions
        </h2>
        <p className="mt-1 text-sm text-[var(--byosync-gray-500)]">
          Requires JWT + Admin (identity:admin).
        </p>
        {actionError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {actionError}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          {canSuspend && (
            <button
              type="button"
              onClick={() => setSuspendOpen(true)}
              disabled={!!actionLoading}
              className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
            >
              Suspend
            </button>
          )}
          {canReactivate && (
            <button
              type="button"
              onClick={handleReactivate}
              disabled={!!actionLoading}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700 disabled:opacity-50"
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
              className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            >
              Revoke
            </button>
          )}
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => navigate(`/identity/${encodeURIComponent(data.uuid)}/history`)}
            className="text-sm font-medium text-[var(--byosync-blue)] hover:underline"
          >
            View lifecycle history →
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate(`/identity/${encodeURIComponent(data.uuid)}`)}
          className="rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/20 transition hover:bg-[var(--byosync-blue-dark)]"
        >
          View full identity
        </button>
        <button
          type="button"
          onClick={() => navigate(`/identity/${encodeURIComponent(data.uuid)}/history`)}
          className="rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)] transition hover:bg-[var(--byosync-gray-50)]"
        >
          View history
        </button>
        <button
          type="button"
          onClick={() => navigate(`/identity/${encodeURIComponent(data.uuid)}/keys`)}
          className="rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)] transition hover:bg-[var(--byosync-gray-50)]"
        >
          Manage keys
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)] transition hover:bg-[var(--byosync-gray-50)]"
        >
          Back to home
        </button>
      </div>

      {/* Suspend modal (same as IdentityView) */}
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
              className="mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 text-sm focus:border-[var(--byosync-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
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
              className="mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 text-sm focus:border-[var(--byosync-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
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
              className="mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 font-mono text-sm focus:border-[var(--byosync-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
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
              className="rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
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
              className="rounded-xl border-2 border-[var(--byosync-gray-200)] px-4 py-2.5 font-semibold text-[var(--byosync-gray-700)] hover:bg-[var(--byosync-gray-50)]"
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
              className="mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 text-sm focus:border-[var(--byosync-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
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
              className="mt-1 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-3 py-2 font-mono text-sm focus:border-[var(--byosync-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
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
              className="rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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
              className="rounded-xl border-2 border-[var(--byosync-gray-200)] px-4 py-2.5 font-semibold text-[var(--byosync-gray-700)] hover:bg-[var(--byosync-gray-50)]"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
