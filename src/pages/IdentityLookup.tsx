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
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-[var(--byosync-gray-900)]">Look up Identity</h1>
      <p className="mt-1 text-sm text-[var(--byosync-gray-500)]">
        Enter an identity UUID to view metadata or status. Requires JWT with identity:read.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
            Identity UUID
          </label>
          <input
            type="text"
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            placeholder="e.g. byos_7f3a9c2d-..."
            className="mt-1 w-full rounded-lg border border-[var(--byosync-gray-200)] px-3 py-2 font-mono text-sm focus:border-[var(--byosync-blue)] focus:ring-1 focus:ring-[var(--byosync-blue)]"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!uuid.trim()}
            className="rounded-lg bg-[var(--byosync-blue)] px-4 py-2 font-medium text-white hover:bg-[var(--byosync-blue-dark)] disabled:opacity-50"
          >
            View metadata
          </button>
          <button
            type="button"
            onClick={handleStatusOnly}
            disabled={!uuid.trim()}
            className="rounded-lg border border-[var(--byosync-gray-300)] bg-white px-4 py-2 font-medium text-[var(--byosync-gray-700)] hover:bg-[var(--byosync-gray-50)] disabled:opacity-50"
          >
            View status only
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 text-sm font-medium text-[var(--byosync-blue)] hover:underline"
      >
        ← Back to home
      </button>
    </div>
  );
}
