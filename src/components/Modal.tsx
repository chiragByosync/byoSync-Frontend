import { useEffect, type ReactNode } from 'react';

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-[var(--byosync-gray-900)]/55 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full max-w-md rounded-2xl border border-[var(--byosync-gray-200)] bg-white p-6 shadow-2xl transition duration-200 sm:p-8 ${className}`}
        style={{ animation: 'modalSlideIn 0.25s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-semibold text-[var(--byosync-gray-900)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2.5 text-[var(--byosync-gray-500)] transition hover:bg-[var(--byosync-gray-100)] hover:text-[var(--byosync-gray-900)] hover:scale-110 active:scale-95"
            aria-label="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        {children}
      </div>
      <style>{`@keyframes modalSlideIn { from { opacity: 0; transform: scale(0.96) translateY(-8px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}
