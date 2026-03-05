import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, MapPin, LogIn } from 'lucide-react';
import { getAndClearConsentError } from '../lib/consentError';
import type { ConsentErrorCode, ConsentErrorPayload } from '../types/consent';
import { FormSection } from '../components/FormSection';

export function ConsentRequired() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codeFromUrl = (searchParams.get('code') ?? '') as ConsentErrorCode;
  const [payload, setPayload] = useState<ConsentErrorPayload | null>(null);

  useEffect(() => {
    const stored = getAndClearConsentError();
    if (stored) setPayload(stored);
    else if (codeFromUrl) setPayload({ code: codeFromUrl });
  }, [codeFromUrl]);

  const code = payload?.code ?? codeFromUrl;
  const goToCreate = () => {
    navigate('/consent/create', {
      state: payload?.verifier_id || payload?.identity_uuid || payload?.purpose
        ? {
            verifier_id: payload.verifier_id,
            identity_uuid: payload.identity_uuid,
            purpose: payload.purpose,
          }
        : undefined,
    });
  };
  const goToAuth = () => navigate('/auth/challenge');

  if (!code) {
    return (
      <div className="mx-auto max-w-xl">
        <FormSection title="Consent required" description="No consent error code was provided. You can grant consent from the Consent page." icon={<ShieldAlert className="h-5 w-5" strokeWidth={2} />}>
          <button type="button" onClick={() => navigate('/consent')} className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white">
            Go to Consent
          </button>
        </FormSection>
      </div>
    );
  }

  const content = (() => {
    switch (code) {
      case 'CONSENT_REQUIRED':
        return {
          title: 'Consent required',
          message: 'This service requires your consent before accessing your data.',
          buttonLabel: 'Grant Consent',
          buttonAction: goToCreate,
          icon: <ShieldAlert className="h-5 w-5" strokeWidth={2} />,
        };
      case 'CONSENT_EXPIRED':
        return {
          title: 'Consent expired',
          message: 'Your consent has expired. Please grant a new consent to continue.',
          buttonLabel: 'Renew Consent',
          buttonAction: goToCreate,
          icon: <RefreshCw className="h-5 w-5" strokeWidth={2} />,
        };
      case 'CONSENT_REVOKED':
        return {
          title: 'Consent revoked',
          message: 'You previously revoked consent for this service.',
          buttonLabel: 'Grant Consent Again',
          buttonAction: goToCreate,
          icon: <RefreshCw className="h-5 w-5" strokeWidth={2} />,
        };
      case 'SCOPE_EXCEEDED':
        return {
          title: 'Scope exceeded',
          message: 'The verifier requested data beyond your approved scope. This is a security alert.',
          buttonLabel: 'Grant expanded consent',
          buttonAction: goToCreate,
          icon: <ShieldAlert className="h-5 w-5" strokeWidth={2} />,
          extra: payload?.requested_scope || payload?.approved_scope ? (
            <div className="mt-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
              {payload?.requested_scope?.length ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Requested data</p>
                  <p className="mt-0.5 text-sm text-amber-900">{payload.requested_scope.join(', ')}</p>
                </div>
              ) : null}
              {payload?.approved_scope?.length ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Your approved scope</p>
                  <p className="mt-0.5 text-sm text-amber-900">{payload.approved_scope.join(', ')}</p>
                </div>
              ) : null}
              <p className="text-xs text-amber-800">You can grant expanded consent if you choose.</p>
            </div>
          ) : null,
        };
      case 'CONSENT_LOCATION_REQUIRED':
        return {
          title: 'Location restriction',
          message: 'This consent is only valid within the approved location (e.g. hotel check-in, office entry, airport gate). Please be at the approved location and try again, or grant a new consent.',
          buttonLabel: 'Grant consent',
          buttonAction: goToCreate,
          icon: <MapPin className="h-5 w-5" strokeWidth={2} />,
        };
      case 'CONSENT_SESSION_REQUIRED':
        return {
          title: 'Session restriction',
          message: 'This consent is valid only for the session in which it was granted. Please re-authenticate.',
          buttonLabel: 'Authenticate Again',
          buttonAction: goToAuth,
          icon: <LogIn className="h-5 w-5" strokeWidth={2} />,
        };
      default:
        return {
          title: 'Consent required',
          message: payload?.message ?? 'Your consent is required to access this resource.',
          buttonLabel: 'Grant Consent',
          buttonAction: goToCreate,
          icon: <ShieldAlert className="h-5 w-5" strokeWidth={2} />,
        };
    }
  })();

  return (
    <div className="mx-auto max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="heading-page">Consent required</h1>
        <p className="mt-3 subheading">
          Story 4.2 — The request was blocked by consent enforcement. Follow the action below to continue.
        </p>
      </motion.div>

      <FormSection
        title={content.title}
        description={content.message}
        icon={content.icon}
        className="mt-10 border-amber-200 bg-amber-50/20"
      >
        {content.extra}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={content.buttonAction}
            className="btn-primary rounded-xl bg-[var(--byosync-blue)] px-5 py-2.5 font-semibold text-white"
          >
            {content.buttonLabel}
          </button>
          <button
            type="button"
            onClick={() => navigate('/consent')}
            className="btn-secondary rounded-xl border-2 border-[var(--byosync-gray-200)] bg-white px-5 py-2.5 font-semibold text-[var(--byosync-gray-700)]"
          >
            Back to Consent
          </button>
        </div>
      </FormSection>
    </div>
  );
}
