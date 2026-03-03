import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getIdentityKeys,
  rotateIdentityKey,
} from '../services/identityApi';
import type {
  IdentityKeyItem,
  IdentityKeyRotateRequest,
  KeyAlgorithm,
} from '../types/identity';
import { isValidBase64 } from '../lib/validation';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FormSection } from '../components/FormSection';

const KEY_ALGORITHMS: KeyAlgorithm[] = ['Ed25519', 'ECDSA_P256'];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function IdentityKeys() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [keysData, setKeysData] = useState<{ uuid: string; keys: IdentityKeyItem[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotateError, setRotateError] = useState<string | null>(null);
  const [rotateLoading, setRotateLoading] = useState(false);
  const [rotateForm, setRotateForm] = useState<IdentityKeyRotateRequest>({
    new_public_key: '',
    current_signature: '',
    algorithm: 'Ed25519',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchKeys = useCallback(async () => {
    if (!uuid) {
      setError('No identity UUID in URL');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getIdentityKeys(uuid);
      setKeysData({ uuid: res.uuid, keys: res.keys ?? [] });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load keys.';
      const status =
        err && typeof err === 'object' && 'status' in err ? (err.status as number) : 0;
      if (status === 401)
        setError('Authentication required (JWT with identity:read).');
      else if (status === 404) setError('Identity not found.');
      else setError(message);
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleRotate = useCallback(async () => {
    if (!uuid) return;
    const newKey = rotateForm.new_public_key.trim();
    const signature = rotateForm.current_signature.trim();
    const err: Record<string, string> = {};
    if (!newKey) err.new_public_key = 'New public key is required';
    else if (!isValidBase64(newKey)) err.new_public_key = 'Must be valid Base64';
    if (!signature) err.current_signature = 'Current signature is required';
    else if (!isValidBase64(signature)) err.current_signature = 'Must be valid Base64';
    if (Object.keys(err).length > 0) {
      setFieldErrors(err);
      return;
    }
    setFieldErrors({});
    setRotateError(null);
    setRotateLoading(true);
    try {
      await rotateIdentityKey(uuid, {
        new_public_key: newKey,
        current_signature: signature,
        algorithm: rotateForm.algorithm,
      });
      setRotateForm({ new_public_key: '', current_signature: '', algorithm: 'Ed25519' });
      await fetchKeys();
    } catch (err: unknown) {
      setRotateError(
        err instanceof Error ? err.message : 'Key rotation failed.'
      );
    } finally {
      setRotateLoading(false);
    }
  }, [uuid, rotateForm, fetchKeys]);

  const inputBase =
    'input-focus mt-1 w-full rounded-xl border bg-[var(--byosync-gray-50)]/50 px-4 py-2.5 text-[var(--byosync-gray-900)] font-mono text-sm placeholder:text-[var(--byosync-gray-500)] transition hover:border-[var(--byosync-gray-300)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--byosync-blue)]/20 focus:border-[var(--byosync-blue)]';
  const inputError = 'border-red-400 focus:ring-red-200 focus:border-red-500';
  const inputOk = 'border-[var(--byosync-gray-200)]';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner className="h-10 w-10" />
        <p className="mt-4 text-[var(--byosync-gray-500)]">Loading keys…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl">
        <ErrorMessage title="Could not load keys" onRetry={fetchKeys}>
          {error}
        </ErrorMessage>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-secondary mt-4 rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--byosync-gray-700)]"
        >
          Back to home
        </button>
      </div>
    );
  }

  const keys = keysData?.keys ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--byosync-gray-900)]">
          Key management
        </h1>
        <p className="mt-2 text-[var(--byosync-gray-500)]">
          List key versions and rotate to a new public key. Requires JWT (identity holder for rotate).
        </p>
      </div>

      {/* Key versions list */}
      <FormSection
        title="Key versions"
        description="All key versions for this identity. Active key is used for signing."
        icon="🔑"
        className="mb-8"
      >
        {keys.length === 0 ? (
          <p className="text-sm text-[var(--byosync-gray-500)]">
            No keys returned yet. Rotate to add the first key or ensure the backend returns key list.
          </p>
        ) : (
          <ul className="space-y-3">
            {keys.map((key) => (
              <li
                key={key.key_version}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--byosync-gray-200)] bg-[var(--byosync-gray-50)]/30 px-4 py-3 transition hover:border-[var(--byosync-gray-300)] hover:bg-[var(--byosync-gray-50)]/60 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-[var(--byosync-blue-pale)] px-2.5 py-1 text-sm font-semibold text-[var(--byosync-blue)]">
                    v{key.key_version}
                  </span>
                  <span className="text-sm font-medium text-[var(--byosync-gray-700)]">
                    {key.algorithm}
                  </span>
                  {key.is_active && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-[var(--byosync-gray-500)]">
                  {key.public_key_fingerprint && (
                    <span className="font-mono text-xs">
                      {key.public_key_fingerprint.slice(0, 16)}…
                    </span>
                  )}
                  <span>{formatDate(key.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </FormSection>

      {/* Rotate key form */}
      <FormSection
        title="Rotate key"
        description="Add a new public key. You must sign the message rotate:{uuid}:{timestamp} with your current private key and provide the Base64 signature."
        icon="↻"
      >
        {rotateError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {rotateError}
          </div>
        )}

        <div className="rounded-xl border border-[var(--byosync-blue-pale)] bg-[var(--byosync-blue-pale)]/20 p-4 text-sm text-[var(--byosync-gray-700)] transition hover:bg-[var(--byosync-blue-pale)]/30">
          <p className="font-medium text-[var(--byosync-gray-900)]">Signature message format</p>
          <p className="mt-1 font-mono text-xs">
            rotate:{uuid}:{'<timestamp>'}
          </p>
          <p className="mt-2">
            Sign this string with your current private key (same algorithm as selected below). Use the current Unix timestamp in seconds for <code className="rounded bg-white/80 px-1">&lt;timestamp&gt;</code>. Submit the signature as Base64.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
            New public key (Base64) <span className="text-red-500">*</span>
          </label>
          <textarea
            value={rotateForm.new_public_key}
            onChange={(e) => {
              setRotateForm((p) => ({ ...p, new_public_key: e.target.value }));
              setFieldErrors((prev) => ({ ...prev, new_public_key: '' }));
            }}
            placeholder="Ed25519 or ECDSA P-256 public key, Base64"
            rows={3}
            className={`${inputBase} ${fieldErrors.new_public_key ? inputError : inputOk}`}
            disabled={rotateLoading}
          />
          {fieldErrors.new_public_key && (
            <p className="mt-1.5 text-sm text-red-600">{fieldErrors.new_public_key}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
            Current signature (Base64) <span className="text-red-500">*</span>
          </label>
          <textarea
            value={rotateForm.current_signature}
            onChange={(e) => {
              setRotateForm((p) => ({ ...p, current_signature: e.target.value }));
              setFieldErrors((prev) => ({ ...prev, current_signature: '' }));
            }}
            placeholder="Signature of rotate:{uuid}:{timestamp}"
            rows={2}
            className={`${inputBase} ${fieldErrors.current_signature ? inputError : inputOk}`}
            disabled={rotateLoading}
          />
          {fieldErrors.current_signature && (
            <p className="mt-1.5 text-sm text-red-600">{fieldErrors.current_signature}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--byosync-gray-700)]">
            Algorithm <span className="text-red-500">*</span>
          </label>
          <select
            value={rotateForm.algorithm}
            onChange={(e) =>
              setRotateForm((p) => ({ ...p, algorithm: e.target.value as KeyAlgorithm }))
            }
            className={`${inputBase} ${inputOk}`}
            disabled={rotateLoading}
          >
            {KEY_ALGORITHMS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleRotate}
            disabled={rotateLoading}
            className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/20 disabled:opacity-60 disabled:hover:transform-none"
          >
            {rotateLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner className="h-4 w-4" /> Rotating…
              </span>
            ) : (
              'Rotate key'
            )}
          </button>
        </div>
      </FormSection>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-[var(--byosync-gray-200)] pt-8">
        <button
          type="button"
          onClick={() => navigate(`/identity/${encodeURIComponent(uuid ?? '')}`)}
          className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[var(--byosync-blue)]/20"
        >
          View identity
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
