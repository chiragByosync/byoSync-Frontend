import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--byosync-gray-900)] sm:text-4xl">
        ByoSync Identity Registry
      </h1>
      <p className="mt-3 text-lg text-[var(--byosync-gray-500)]">
        Zero-biometrics identity platform. Create and manage identity records.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/identity/create"
          className="group card-hover rounded-2xl border border-[var(--byosync-gray-200)] bg-white p-6 text-left shadow-sm transition hover:border-[var(--byosync-blue-light)] hover:shadow-lg hover:shadow-[var(--byosync-blue)]/10 active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] text-xl font-medium transition duration-200 group-hover:scale-110 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-md">
            +
          </span>
          <h2 className="mt-4 text-lg font-semibold text-[var(--byosync-gray-900)]">
            Create Identity
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--byosync-gray-500)]">
            Register a new identity with public key, KYC level, sector, and personal details.
          </p>
        </Link>

        <Link
          to="/identity/lookup"
          className="group card-hover rounded-2xl border border-[var(--byosync-gray-200)] bg-white p-6 text-left shadow-sm transition hover:border-[var(--byosync-blue-light)] hover:shadow-lg hover:shadow-[var(--byosync-blue)]/10 active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] text-xl font-medium transition duration-200 group-hover:scale-110 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-md">
            →
          </span>
          <h2 className="mt-4 text-lg font-semibold text-[var(--byosync-gray-900)]">
            Look up Identity
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--byosync-gray-500)]">
            Enter a UUID to view metadata, status, <strong>lifecycle actions</strong>, <strong>history</strong>, and <strong>key management</strong>.
          </p>
        </Link>

        <Link
          to="/auth/challenge"
          className="group card-hover rounded-2xl border border-[var(--byosync-gray-200)] bg-white p-6 text-left shadow-sm transition hover:border-[var(--byosync-blue-light)] hover:shadow-lg hover:shadow-[var(--byosync-blue)]/10 active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] text-xl font-medium transition duration-200 group-hover:scale-110 group-hover:bg-[var(--byosync-blue)] group-hover:text-white group-hover:shadow-md">
            🔐
          </span>
          <h2 className="mt-4 text-lg font-semibold text-[var(--byosync-gray-900)]">
            Request challenge
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--byosync-gray-500)]">
            Issue a cryptographic nonce for proof-of-key authentication (attendance, KYC, gate, etc.).
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--byosync-blue-pale)] bg-[var(--byosync-blue-pale)]/40 px-5 py-4 text-left shadow-sm transition hover:shadow-md">
        <p className="text-sm font-medium text-[var(--byosync-gray-900)]">Where to see lifecycle options</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--byosync-gray-600)]">
          <li><strong>After creating an identity</strong> — you’re taken to the identity page; scroll to the <strong>Lifecycle</strong> section.</li>
          <li><strong>From Look up</strong> — enter a UUID, then <strong>View metadata</strong> or <strong>View status only</strong>. Both show lifecycle actions, <strong>View lifecycle history</strong>, and <strong>Manage keys</strong>.</li>
        </ul>
      </div>

      <p className="mt-8 text-sm text-[var(--byosync-gray-500)]">
        Identity Registry Service. Connect your backend via <code className="rounded bg-[var(--byosync-gray-100)] px-1.5 py-0.5 font-mono text-xs">VITE_API_BASE</code> and <code className="rounded bg-[var(--byosync-gray-100)] px-1.5 py-0.5 font-mono text-xs">VITE_API_KEY</code>.
      </p>
    </div>
  );
}
