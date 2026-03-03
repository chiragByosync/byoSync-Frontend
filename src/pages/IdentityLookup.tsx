import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Activity, ArrowLeft } from 'lucide-react';

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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="heading-page">Look up Identity</h1>
        <p className="mt-3 subheading">
          Enter an identity UUID to view metadata or status. Requires JWT with identity:read.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
        className="card-hover mt-10 rounded-2xl border border-[var(--byosync-gray-200)] bg-white/95 p-6 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-8"
      >
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
              className="btn-primary flex items-center gap-2 rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/20 disabled:opacity-50 disabled:hover:transform-none"
            >
              <FileText className="h-4 w-4" />
              View metadata
            </button>
            <button
              type="button"
              onClick={handleStatusOnly}
              disabled={!uuid.trim()}
              className="btn-secondary flex items-center gap-2 rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)] transition disabled:opacity-50"
            >
              <Activity className="h-4 w-4" />
              View status only
            </button>
          </div>
        </form>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => navigate('/')}
        className="mt-8 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--byosync-blue)] transition-all duration-300 hover:bg-[var(--byosync-blue-pale)] hover:-translate-y-0.5 active:scale-[0.98]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </motion.button>
    </div>
  );
}
