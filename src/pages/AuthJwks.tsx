import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Key, ArrowLeft, Home } from 'lucide-react';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FormSection } from '../components/FormSection';

function getJwksUrl(): string {
  const env = import.meta.env.VITE_JWKS_URL;
  if (env) return env;
  const base = import.meta.env.VITE_API_BASE ?? '/api/v1';
  try {
    const u = new URL(base, window.location.origin);
    return `${u.origin}/.well-known/jwks.json`;
  } catch {
    return `${window.location.origin}/.well-known/jwks.json`;
  }
}
const JWKS_URL = getJwksUrl();

interface JwksKey {
  kty?: string;
  kid?: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  crv?: string;
  x?: string;
  [key: string]: unknown;
}

interface JwksResponse {
  keys?: JwksKey[];
}

export function AuthJwks() {
  const [data, setData] = useState<JwksResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJwks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(JWKS_URL);
      const contentType = res.headers.get('content-type') ?? '';
      if (!res.ok) {
        throw new Error(`Failed to load: ${res.status}`);
      }
      if (!contentType.includes('application/json')) {
        throw new Error(
          'Server returned non-JSON (often HTML). Ensure the backend exposes GET /.well-known/jwks.json and, in dev, that the proxy forwards /.well-known to the backend.'
        );
      }
      const json = await res.json();
      setData(json as JwksResponse);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to load JWKS.';
      const friendly =
        typeof message === 'string' && message.includes('Unexpected token')
          ? 'Server returned HTML instead of JSON. The JWKS endpoint may be missing on the backend, or the request is not being proxied to the backend (in dev, proxy /.well-known to your API server).'
          : message;
      setError(friendly);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJwks();
  }, [fetchJwks]);

  const headingBlock = (
    <div className="mb-10">
      <h1 className="heading-page">Verification keys (JWKS)</h1>
      <p className="mt-3 subheading">
        Public keys for verifying assertion tokens. Verifiers can cache this endpoint.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        {headingBlock}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-hover flex flex-col items-center justify-center rounded-2xl border border-[var(--byosync-gray-200)] bg-white/95 py-16 shadow-[var(--shadow-card)] backdrop-blur-sm"
        >
          <LoadingSpinner className="h-10 w-10" />
          <p className="mt-4 text-[var(--byosync-gray-500)]">Loading JWKS…</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        {headingBlock}
        <ErrorMessage title="Could not load JWKS" onRetry={fetchJwks}>
          {error}
        </ErrorMessage>
        <p className="mt-4 text-sm text-[var(--byosync-gray-500)]">
          Endpoint: <code className="rounded bg-[var(--byosync-gray-100)] px-1 font-mono">{JWKS_URL}</code>
        </p>
        <Link
          to="/auth/challenge"
          className="btn-secondary mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-4 py-2.5 font-semibold text-[var(--byosync-gray-700)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" /> Challenge
        </Link>
      </div>
    );
  }

  const keys = data?.keys ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      {headingBlock}
      <p className="mt-1 text-xs text-[var(--byosync-gray-500)]">
        Endpoint: <code className="rounded bg-[var(--byosync-gray-100)] px-1.5 py-0.5 font-mono">{JWKS_URL}</code>
      </p>

      <FormSection
        title="Public keys"
        description="Use these to verify ByoSync assertion JWTs without calling the API."
        icon={<Key className="h-5 w-5" strokeWidth={2} />}
      >
        {keys.length === 0 ? (
          <p className="text-sm text-[var(--byosync-gray-500)]">No keys in JWKS response.</p>
        ) : (
          <ul className="space-y-4">
            {keys.map((key, i) => (
              <li
                key={key.kid ?? i}
                className="rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/40 p-4 transition hover:border-[var(--byosync-gray-300)] hover:bg-[var(--byosync-gray-50)]/70"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {key.kid && (
                    <span className="rounded-lg bg-[var(--byosync-blue-pale)] px-2.5 py-1 text-sm font-semibold text-[var(--byosync-blue)]">
                      {key.kid}
                    </span>
                  )}
                  {key.alg && (
                    <span className="rounded bg-[var(--byosync-gray-200)] px-2 py-0.5 text-xs font-medium text-[var(--byosync-gray-700)]">
                      {key.alg}
                    </span>
                  )}
                  {key.kty && (
                    <span className="text-xs text-[var(--byosync-gray-500)]">kty: {key.kty}</span>
                  )}
                </div>
                {(key.x || key.n) && (
                  <p className="mt-2 font-mono text-xs text-[var(--byosync-gray-600)] break-all">
                    {key.x ? `x: ${key.x.slice(0, 48)}…` : key.n ? `n: ${key.n.slice(0, 48)}…` : null}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </FormSection>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/auth/challenge"
          className="btn-primary inline-flex items-center gap-2 rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/20"
        >
          <Key className="h-4 w-4" /> Request challenge
        </Link>
        <Link
          to="/"
          className="btn-secondary inline-flex items-center gap-2 rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
        >
          <Home className="h-4 w-4" /> Home
        </Link>
      </div>
    </div>
  );
}
