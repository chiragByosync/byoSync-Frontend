import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Key, ArrowRight } from 'lucide-react';

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

export function AuthHome() {
  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        className="relative text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="hero-glow" aria-hidden />
        <h1 className="heading-page">Authentication</h1>
        <p className="mt-5 body-lg text-[var(--byosync-gray-600)] max-w-2xl mx-auto leading-relaxed">
          Request cryptographic challenges and view verification keys (JWKS) for proof-of-key flows.
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

        <motion.div variants={item}>
          <Link
            to="/auth/jwks"
            className="group card-hover flex flex-col rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/50 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
              <Key className="h-6 w-6" strokeWidth={2} />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--byosync-gray-900)]">
              Verification keys (JWKS)
            </h2>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--byosync-gray-500)]">
              View the public JWKS endpoint for verifying signatures and tokens.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--byosync-blue)] opacity-0 transition-all duration-300 group-hover:opacity-100">
              View JWKS <ArrowRight className="h-4 w-4" />
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
        <p className="text-[0.9375rem] font-semibold text-[var(--byosync-gray-900)]">Proof-of-key authentication</p>
        <p className="mt-2 text-[0.9375rem] text-[var(--byosync-gray-600)] leading-relaxed">
          Request a challenge nonce for an identity; the holder signs it with their private key. Use JWKS to verify signatures and tokens. Supports attendance, KYC checks, and gated access without storing passwords or biometrics.
        </p>
      </motion.div>
    </div>
  );
}
