import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = '' }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handle);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handle);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-modal-backdrop absolute inset-0"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`glass-modal-panel relative w-full max-w-md rounded-2xl p-6 sm:p-8 ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 id="modal-title" className="heading-section text-xl">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2.5 text-[var(--byosync-gray-500)] transition-all duration-300 hover:bg-[var(--byosync-gray-100)]/80 hover:text-[var(--byosync-gray-900)] hover:-translate-y-0.5 active:scale-95"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
