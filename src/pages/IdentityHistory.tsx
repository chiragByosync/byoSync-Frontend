import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIdentityHistory } from '../services/identityApi';
import type { LifecycleEvent } from '../types/identity';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';

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

export function IdentityHistory() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!uuid) {
      setError('No identity UUID in URL');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getIdentityHistory(uuid);
      setEvents(res.events ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load history.';
      const status =
        err && typeof err === 'object' && 'status' in err ? (err.status as number) : 0;
      if (status === 401)
        setError('Authentication required (JWT with identity:read).');
      else if (status === 404) setError('Identity not found.');
      else setError(message);
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner />
        <p className="mt-4 text-[var(--byosync-gray-500)]">Loading history…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl">
        <ErrorMessage title="Could not load history" onRetry={fetchHistory}>
          {error}
        </ErrorMessage>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-secondary mt-4 rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--byosync-gray-700)]"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="heading-page">Lifecycle History</h1>
        <p className="mt-3 subheading">
          Full event history for this identity. Requires JWT with identity:read.
        </p>
      </div>

      <div className="card-hover rounded-2xl border border-[var(--byosync-gray-200)] bg-white/95 shadow-[var(--shadow-card)] overflow-hidden backdrop-blur-sm">
        {events.length === 0 ? (
          <div className="px-6 py-12 text-center text-[var(--byosync-gray-500)]">
            No lifecycle events recorded yet.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--byosync-gray-100)]">
            {events.map((event, i) => (
              <EventRow key={i} event={event} />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate(`/identity/${encodeURIComponent(uuid ?? '')}`)}
          className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/20"
        >
          View identity
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}

const VALID_STATUSES = ['ACTIVE', 'SUSPENDED', 'REVOKED', 'PENDING'] as const;

function EventRow({ event }: { event: LifecycleEvent }) {
  const raw = event.status ?? (event as { event_type?: string }).event_type ?? '—';
  const isStatus = VALID_STATUSES.includes(raw as (typeof VALID_STATUSES)[number]);
  return (
    <li className="px-6 py-4 transition hover:bg-[var(--byosync-gray-50)]/80 sm:px-8 sm:py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {isStatus ? (
            <StatusBadge status={raw as LifecycleEvent['status']} />
          ) : (
            <span className="rounded-full bg-[var(--byosync-gray-100)] px-3 py-1 text-sm font-medium text-[var(--byosync-gray-700)]">
              {raw}
            </span>
          )}
          <span className="text-sm text-[var(--byosync-gray-500)]">
            {formatDate(event.created_at)}
          </span>
        </div>
        {event.actor_id && (
          <span className="font-mono text-xs text-[var(--byosync-gray-500)]">
            actor: {event.actor_id}
          </span>
        )}
      </div>
      {event.reason && (
        <p className="mt-2 text-sm text-[var(--byosync-gray-700)]">{event.reason}</p>
      )}
    </li>
  );
}
