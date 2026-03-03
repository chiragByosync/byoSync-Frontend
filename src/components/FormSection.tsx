import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  description?: string;
  /** Icon: ReactNode (e.g. Lucide icon) or string (e.g. "✓") */
  icon?: ReactNode | string;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  icon,
  children,
  className = '',
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`card-hover rounded-2xl border border-[var(--byosync-gray-200)] bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-md transition hover:border-[var(--byosync-gray-300)] hover:shadow-[var(--shadow-card-hover)] sm:p-8 ${className}`}
    >
      <div className="mb-6 flex items-start gap-4">
        {icon != null && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] text-lg transition duration-300 group-hover:scale-105">
            {typeof icon === 'string' ? icon : icon}
          </span>
        )}
        <div>
          <h2 className="heading-section">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-[var(--byosync-gray-500)]">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </motion.section>
  );
}
