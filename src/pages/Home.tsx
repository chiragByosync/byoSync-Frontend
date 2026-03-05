import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fingerprint, ClipboardList, Building2, Shield, ArrowRight } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export function Home() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Hero */}
      <motion.div
        className="relative text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="hero-glow" aria-hidden />
        <h1 className="heading-hero">
          ByoSync Identity Registry
        </h1>
        <p className="mt-6 text-lg font-normal tracking-tight text-[var(--byosync-gray-600)] max-w-2xl mx-auto leading-relaxed subheading-modern">
          Zero-biometrics identity platform. Create and manage identity records with trust and security.
        </p>
      </motion.div>

      {/* About ByoSync — on page, above options */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-10 max-w-2xl mx-auto text-center text-[0.9375rem] sm:text-base text-[var(--byosync-gray-600)] leading-relaxed"
      >
        ByoSync combines <strong className="text-[var(--byosync-gray-800)] font-medium">identity records</strong> (public key, KYC, lifecycle), a <strong className="text-[var(--byosync-gray-800)] font-medium">consent engine</strong> aligned with DPDP 2023, <strong className="text-[var(--byosync-gray-800)] font-medium">verifier management</strong> with scoped API keys, and <strong className="text-[var(--byosync-gray-800)] font-medium">proof-of-key authentication</strong>—so you can verify who someone is without storing biometric data.
      </motion.p>

      {/* Vertical full-width dashboard cards */}
      <motion.div
        className="mt-12 space-y-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardItem}>
          <Link
            to="/identity"
            className="group dashboard-card block w-full rounded-2xl border border-[var(--byosync-gray-200)] bg-white/95 p-8 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/60 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.995] sm:p-10"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
                  <Fingerprint className="h-7 w-7" strokeWidth={2} />
                </span>
                <div>
                  <h2 className="dashboard-card-title">Identity</h2>
                  <p className="mt-2 text-base leading-relaxed text-[var(--byosync-gray-600)] dashboard-card-desc">
                    Create and look up identities. Manage lifecycle, history, and keys.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-[var(--byosync-blue)] font-semibold dashboard-card-cta">
                Open dashboard <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={cardItem}>
          <Link
            to="/consent"
            className="group dashboard-card block w-full rounded-2xl border border-[var(--byosync-gray-200)] bg-white/95 p-8 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/60 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.995] sm:p-10"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
                  <ClipboardList className="h-7 w-7" strokeWidth={2} />
                </span>
                <div>
                  <h2 className="dashboard-card-title">Consent Engine</h2>
                  <p className="mt-2 text-base leading-relaxed text-[var(--byosync-gray-600)] dashboard-card-desc">
                    DPDP 2023 aligned. Create consent, get by ID, list active consents by identity.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-[var(--byosync-blue)] font-semibold dashboard-card-cta">
                Open dashboard <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={cardItem}>
          <Link
            to="/verifier"
            className="group dashboard-card block w-full rounded-2xl border border-[var(--byosync-gray-200)] bg-white/95 p-8 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/60 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.995] sm:p-10"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
                  <Building2 className="h-7 w-7" strokeWidth={2} />
                </span>
                <div>
                  <h2 className="dashboard-card-title">Verifier Management</h2>
                  <p className="mt-2 text-base leading-relaxed text-[var(--byosync-gray-600)] dashboard-card-desc">
                    Register verifiers, view profile, usage stats, and rotate API keys.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-[var(--byosync-blue)] font-semibold dashboard-card-cta">
                Open dashboard <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={cardItem}>
          <Link
            to="/auth"
            className="group dashboard-card block w-full rounded-2xl border border-[var(--byosync-gray-200)] bg-white/95 p-8 shadow-[var(--shadow-card)] backdrop-blur-md transition-all duration-300 hover:border-[var(--byosync-blue-light)]/60 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.995] sm:p-10"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-lg">
                  <Shield className="h-7 w-7" strokeWidth={2} />
                </span>
                <div>
                  <h2 className="dashboard-card-title">Authentication</h2>
                  <p className="mt-2 text-base leading-relaxed text-[var(--byosync-gray-600)] dashboard-card-desc">
                    Request challenge and view verification keys (JWKS) for proof-of-key flows.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-[var(--byosync-blue)] font-semibold dashboard-card-cta">
                Open dashboard <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      <p className="mt-12 text-sm font-medium tracking-tight text-[var(--byosync-gray-500)]">
        Identity Registry Service. Connect your backend via <code className="rounded bg-[var(--byosync-gray-100)] px-1.5 py-0.5 font-mono text-xs">VITE_API_BASE</code> and <code className="rounded bg-[var(--byosync-gray-100)] px-1.5 py-0.5 font-mono text-xs">VITE_API_KEY</code>.
      </p>
    </div>
  );
}
