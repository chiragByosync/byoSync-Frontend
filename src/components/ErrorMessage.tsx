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
      className={`rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 ${className}`}
      role="alert"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm">{children}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200"
        >
          Try again
        </button>
      )}
    </div>
  );
}
