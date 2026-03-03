import { motion } from 'framer-motion';

interface Props {
  className?: string;
}

export function LoadingSpinner({ className = '' }: Props) {
  return (
    <motion.div
      className={`inline-block rounded-full border-2 border-[var(--byosync-blue)]/30 border-t-[var(--byosync-blue)] ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
      aria-label="Loading"
    />
  );
}
