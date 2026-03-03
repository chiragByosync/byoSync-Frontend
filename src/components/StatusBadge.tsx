import type { IdentityStatus } from '../types/identity';

interface Props {
  status: IdentityStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: Props) {
  const styles: Record<IdentityStatus, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/60',
    SUSPENDED: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200/60',
    REVOKED: 'bg-red-100 text-red-800 ring-1 ring-red-200/60',
    PENDING: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/60',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold transition hover:scale-105 ${styles[status]} ${className}`}
    >
      {status}
    </span>
  );
}
