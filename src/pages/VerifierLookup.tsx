import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';

export function VerifierLookup() {
  const navigate = useNavigate();
  const [verifierId, setVerifierId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = verifierId.trim();
    if (!id) return;
    navigate(`/verifier/${encodeURIComponent(id)}`);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="heading-page">Look up verifier</h1>
      <p className="mt-3 subheading">
        Enter a verifier ID to view profile, usage, and manage API key. Requires JWT with verifier:read.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="card-hover mt-10 rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
              Verifier ID
            </label>
            <input
              type="text"
              value={verifierId}
              onChange={(e) => setVerifierId(e.target.value)}
              placeholder="e.g. ver_q1w2e3r4..."
              className="input-focus mt-1.5 w-full rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/50 px-4 py-3 font-mono text-sm transition placeholder:text-[var(--byosync-gray-500)] focus:border-[var(--byosync-blue)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20"
            />
          </div>
          <button
            type="submit"
            disabled={!verifierId.trim()}
            className="btn-primary flex items-center gap-2 rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            <Search className="h-4 w-4" /> Look up
          </button>
        </form>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => navigate('/verifier')}
        className="mt-8 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--byosync-blue)] transition-all duration-300 hover:bg-[var(--byosync-blue-pale)] hover:-translate-y-0.5 active:scale-[0.98]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Verifier
      </motion.button>
    </div>
  );
}
