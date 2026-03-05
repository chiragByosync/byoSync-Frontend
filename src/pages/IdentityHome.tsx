import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Search, ArrowRight } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function IdentityHome() {
  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        className="relative text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="hero-glow" aria-hidden />
        <h1 className="heading-page">Identity</h1>
        <p className="mt-5 body-lg text-[var(--byosync-gray-600)] max-w-2xl mx-auto leading-relaxed">
          Create and manage identity records. Zero-biometrics: public key, KYC level, sector, and lifecycle controls.
        </p>
      </motion.div>

      <motion.div
        className="mt-16 grid gap-6 sm:grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Link
            to="/identity/create"
            className="group card-hover flex flex-col rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/50 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
              <UserPlus className="h-6 w-6" strokeWidth={2} />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--byosync-gray-900)]">
              Create Identity
            </h2>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--byosync-gray-500)]">
              Register a new identity with public key, KYC level, sector, and personal details.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--byosync-blue)] opacity-0 transition-all duration-300 group-hover:opacity-100">
              Get started <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link
            to="/identity/lookup"
            className="group card-hover flex flex-col rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/50 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
              <Search className="h-6 w-6" strokeWidth={2} />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--byosync-gray-900)]">
              Look up Identity
            </h2>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--byosync-gray-500)]">
              Enter a UUID to view metadata, status, lifecycle actions, history, and key management.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--byosync-blue)] opacity-0 transition-all duration-300 group-hover:opacity-100">
              Look up <ArrowRight className="h-4 w-4" />
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
        <p className="text-[0.9375rem] font-semibold text-[var(--byosync-gray-900)]">Identity records</p>
        <p className="mt-2 text-[0.9375rem] text-[var(--byosync-gray-600)] leading-relaxed">
          Identities are stored with a public key, KYC level, sector, and lifecycle state—no biometrics. Create identities, look up by UUID, and manage status (active, suspended, revoked), lifecycle history, and key rotation from the lookup flow.
        </p>
      </motion.div>
    </div>
  );
}
