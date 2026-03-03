import type { ReactNode } from 'react';

interface Props {
  title?: string;
  children: ReactNode;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ title = 'Error', children, onRetry, className = '' }: Props) {
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50/95 p-4 shadow-sm transition hover:shadow-md ${className}`}
      role="alert"
    >
      <p className="font-semibold text-red-800">{title}</p>
      <p className="mt-1 text-sm text-red-700">{children}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Try again
        </button>
      )}
    </div>
  );
}
