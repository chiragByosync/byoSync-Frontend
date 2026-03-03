interface Props {
  className?: string;
}

export function LoadingSpinner({ className = '' }: Props) {
  return (
    <div
      className={`inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--byosync-blue)] border-t-transparent ${className}`}
      style={{ animationDuration: '0.7s' }}
      aria-label="Loading"
    />
  );
}
