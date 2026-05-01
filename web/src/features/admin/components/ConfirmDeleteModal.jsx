export default function ConfirmDeleteModal({
  isOpen,
  user,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !user) return null;

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <div className="admin-modal w-full" style={{ maxWidth: '520px' }} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Confirm Delete User</h2>
          <button onClick={onClose} className="admin-modal-close-btn" aria-label="Close delete modal">×</button>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-5">
          <p className="text-sm text-red-200 font-semibold">
            This action cannot be undone.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 mb-6">
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-400">Name</span>
            <span className="text-white font-semibold text-right">{fullName}</span>
          </div>
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-400">Email</span>
            <span className="text-white font-semibold text-right">{user.email || 'N/A'}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="admin-modal-cancel-btn flex-1">
            Cancel
          </button>
          <button onClick={onConfirm} className="admin-modal-danger-btn flex-1">
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}
