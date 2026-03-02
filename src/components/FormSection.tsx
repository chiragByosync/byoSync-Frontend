import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  icon = '◆',
  children,
  className = '',
}: Props) {
  return (
    <section
      className={`rounded-2xl border border-[var(--byosync-gray-200)] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8 ${className}`}
    >
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--byosync-blue-pale)] text-[var(--byosync-blue)] text-lg">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-[var(--byosync-gray-900)]">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-[var(--byosync-gray-500)]">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
