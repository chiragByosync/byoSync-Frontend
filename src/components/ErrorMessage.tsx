import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  title?: string;
  children: ReactNode;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ title = 'Error', children, onRetry, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col gap-3 rounded-xl border border-red-200/80 bg-red-50/95 p-4 shadow-sm backdrop-blur-sm transition hover:shadow-md ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" strokeWidth={2} />
        <p className="font-semibold text-red-800">{title}</p>
      </div>
      <p className="text-sm text-red-700">{children}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-secondary mt-1 flex w-fit items-center gap-2 rounded-xl border-2 border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </motion.div>
  );
}
