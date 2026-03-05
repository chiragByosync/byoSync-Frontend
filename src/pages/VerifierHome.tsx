import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, PlusCircle, Search, ArrowRight } from 'lucide-react';

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

export function VerifierHome() {
  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        className="relative text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="hero-glow" aria-hidden />
        <h1 className="heading-page">Verifier Management</h1>
        <p className="mt-5 body-lg text-[var(--byosync-gray-500)] max-w-2xl mx-auto leading-relaxed">
          Register and manage verifier organizations. Each verifier gets a unique ID, API key, and scoped permissions for identity verification.
        </p>
      </motion.div>

      <motion.div
        className="mt-20 grid gap-6 sm:grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Link
            to="/verifier/register"
            className="group card-hover flex flex-col rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/50 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
              <PlusCircle className="h-6 w-6" strokeWidth={2} />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--byosync-gray-900)]">
              Register verifier
            </h2>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--byosync-gray-500)]">
              Create a new verifier: org name, sector, contact, allowed purposes and scopes, trust tier. Requires Master API Key.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--byosync-blue)] opacity-0 transition-all duration-300 group-hover:opacity-100">
              Register <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link
            to="/verifier/lookup"
            className="group card-hover flex flex-col rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/50 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
              <Search className="h-6 w-6" strokeWidth={2} />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--byosync-gray-900)]">
              Look up verifier
            </h2>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--byosync-gray-500)]">
              View verifier profile by ID: settings, usage stats, and rotate API key. Requires JWT with verifier:read.
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
        <p className="text-[0.9375rem] font-semibold text-[var(--byosync-gray-900)]">Verifier Management</p>
        <p className="mt-2 text-[0.9375rem] text-[var(--byosync-gray-600)] leading-relaxed">
          Verifiers are organizations or applications that use ByoSync APIs to verify identities. Each gets a unique ID, hashed API key, and scoped permissions. Registration requires Master API Key; profile and usage require JWT with verifier:read; updates and key rotation require verifier:admin.
        </p>
      </motion.div>
    </div>
  );
}
