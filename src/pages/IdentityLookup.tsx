import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function IdentityLookup() {
  const [uuid, setUuid] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = uuid.trim();
    if (!trimmed) return;
    navigate(`/identity/${encodeURIComponent(trimmed)}`);
  };

  const handleStatusOnly = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = uuid.trim();
    if (!trimmed) return;
    navigate(`/identity/${encodeURIComponent(trimmed)}/status`);
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--byosync-gray-900)]">
        Look up Identity
      </h1>
      <p className="mt-2 text-[var(--byosync-gray-500)]">
        Enter an identity UUID to view metadata or status. Requires JWT with identity:read.
      </p>

      <div className="card-hover mt-8 rounded-2xl border border-[var(--byosync-gray-200)] bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Identity UUID
            </label>
            <input
              type="text"
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
              placeholder="e.g. byos_7f3a9c2d-..."
              className="input-focus mt-1.5 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-4 py-3 font-mono text-sm transition placeholder:text-[var(--byosync-gray-500)] focus:border-[var(--byosync-blue)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20 hover:border-[var(--byosync-gray-300)]"
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={!uuid.trim()}
              className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/20 disabled:opacity-50 disabled:hover:transform-none"
            >
              View metadata
            </button>
            <button
              type="button"
              onClick={handleStatusOnly}
              disabled={!uuid.trim()}
              className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)] transition disabled:opacity-50"
            >
              View status only
            </button>
          </div>
        </form>
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--byosync-blue)] transition hover:bg-[var(--byosync-blue-pale)] hover:scale-[1.02] active:scale-[0.98]"
      >
        ← Back to home
      </button>
    </div>
  );
}
