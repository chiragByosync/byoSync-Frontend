import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FilePlus2, Search, List, ArrowRight } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function ConsentHome() {
  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        className="relative text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="hero-glow" aria-hidden />
        <h1 className="heading-page">Consent Engine</h1>
        <p className="mt-5 body-lg text-[var(--byosync-gray-500)] max-w-2xl mx-auto leading-relaxed">
          DPDP 2023 aligned. Create and manage consent records. Every verifier must have valid, in-scope consent before accessing identity data.
        </p>
      </motion.div>

      <motion.div
        className="mt-20 grid gap-6 sm:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Link
            to="/consent/create"
            className="group card-hover flex flex-col rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/50 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
              <FilePlus2 className="h-6 w-6" strokeWidth={2} />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--byosync-gray-900)]">
              Create consent
            </h2>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--byosync-gray-500)]">
              Create a new consent record: identity, verifier, purpose, data scope, and duration.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--byosync-blue)] opacity-0 transition-all duration-300 group-hover:opacity-100">
              Create <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link
            to="/consent/lookup"
            className="group card-hover flex flex-col rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/50 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
              <Search className="h-6 w-6" strokeWidth={2} />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--byosync-gray-900)]">
              Get consent details
            </h2>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--byosync-gray-500)]">
              Fetch a consent record by consent_id. View full details and status.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--byosync-blue)] opacity-0 transition-all duration-300 group-hover:opacity-100">
              Look up <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link
            to="/consent/identity"
            className="group card-hover flex flex-col rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/50 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
              <List className="h-6 w-6" strokeWidth={2} />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--byosync-gray-900)]">
              Active consents by identity
            </h2>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--byosync-gray-500)]">
              List all active consents for an identity UUID.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--byosync-blue)] opacity-0 transition-all duration-300 group-hover:opacity-100">
              List <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="mt-14 rounded-2xl border border-[var(--byosync-blue-pale)] bg-white/80 px-6 py-5 shadow-sm backdrop-blur-sm"
      >
        <p className="text-[0.9375rem] font-semibold text-[var(--byosync-gray-900)]">DPDP compliance</p>
        <p className="mt-2 text-[0.9375rem] text-[var(--byosync-gray-600)] leading-relaxed">
          Consent must be freely given, specific, informed, and unambiguous. Duration is bounded (max 8760 hours). Purpose is explicit. Users can revoke at any time.
        </p>
      </motion.div>
    </div>
  );
}
