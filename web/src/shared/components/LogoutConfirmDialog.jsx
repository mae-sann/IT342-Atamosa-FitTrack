import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function LogoutConfirmDialog({ isOpen, onCancel, onConfirm, isProcessing = false }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isProcessing) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      aria-describedby="logout-confirm-message"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11182b]/95 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="logout-confirm-title" className="text-lg font-bold text-white">
          Confirm Logout
        </h2>
        <p id="logout-confirm-message" className="mt-2 text-sm text-gray-300">
          Are you sure you want to logout?
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: '#1f2937',
              color: '#d1d5db',
              border: '1px solid rgba(255,255,255,0.18)',
              transform: 'none',
              boxShadow: 'none',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: '1px solid rgba(239,68,68,0.45)',
              transform: 'none',
              boxShadow: 'none',
            }}
          >
            {isProcessing ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
