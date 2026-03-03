import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Search, ShieldCheck, ArrowRight } from 'lucide-react';

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

export function Home() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero with animated glow behind */}
      <motion.div
        className="relative text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="hero-glow" aria-hidden />
        <h1 className="heading-page">
          ByoSync Identity Registry
        </h1>
        <p className="mt-5 body-lg text-[var(--byosync-gray-500)] max-w-2xl mx-auto leading-relaxed">
          Zero-biometrics identity platform. Create and manage identity records with trust and security.
        </p>
      </motion.div>

      <motion.div
        className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
              Enter a UUID to view metadata, status, <strong>lifecycle actions</strong>, <strong>history</strong>, and <strong>key management</strong>.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--byosync-blue)] opacity-0 transition-all duration-300 group-hover:opacity-100">
              Look up <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link
            to="/auth/challenge"
            className="group card-hover flex flex-col rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/50 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
              <ShieldCheck className="h-6 w-6" strokeWidth={2} />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--byosync-gray-900)]">
              Request challenge
            </h2>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--byosync-gray-500)]">
              Issue a cryptographic nonce for proof-of-key authentication (attendance, KYC, gate, etc.).
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--byosync-blue)] opacity-0 transition-all duration-300 group-hover:opacity-100">
              Request <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="mt-14 rounded-2xl border border-[var(--byosync-blue-pale)] bg-white/80 px-6 py-5 shadow-sm backdrop-blur-sm transition hover:shadow-md"
      >
        <p className="text-[0.9375rem] font-semibold text-[var(--byosync-gray-900)]">Where to see lifecycle options</p>
        <ul className="mt-2.5 list-inside list-disc space-y-1.5 text-[0.9375rem] text-[var(--byosync-gray-600)] leading-relaxed">
          <li><strong>After creating an identity</strong> — you're taken to the identity page; scroll to the <strong>Lifecycle</strong> section.</li>
          <li><strong>From Look up</strong> — enter a UUID, then <strong>View metadata</strong> or <strong>View status only</strong>. Both show lifecycle actions, <strong>View lifecycle history</strong>, and <strong>Manage keys</strong>.</li>
        </ul>
      </motion.div>

      <p className="mt-12 text-[0.9375rem] font-medium text-[var(--byosync-gray-500)]">
        Identity Registry Service. Connect your backend via <code className="rounded bg-[var(--byosync-gray-100)] px-1.5 py-0.5 font-mono text-xs">VITE_API_BASE</code> and <code className="rounded bg-[var(--byosync-gray-100)] px-1.5 py-0.5 font-mono text-xs">VITE_API_KEY</code>.
      </p>
    </div>
  );
}
