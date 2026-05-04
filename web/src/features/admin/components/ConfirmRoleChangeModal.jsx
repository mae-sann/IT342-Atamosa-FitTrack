export default function ConfirmRoleChangeModal({
  isOpen,
  user,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !user) return null;

  const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <div className="admin-modal w-full" style={{ maxWidth: '520px' }} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Confirm Role Change</h2>
          <button onClick={onClose} className="admin-modal-close-btn" aria-label="Close role change modal">×</button>
        </div>

        <p className="text-sm text-gray-300 mb-5">
          You are about to change this user's role.
        </p>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 mb-6">
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-400">Name</span>
            <span className="text-white font-semibold text-right">{fullName}</span>
          </div>
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-400">Email</span>
            <span className="text-white font-semibold text-right">{user.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-400">Current Role</span>
            <span className="text-white font-semibold text-right">{user.role || 'USER'}</span>
          </div>
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-400">New Role</span>
            <span className="text-blue-300 font-semibold text-right">{nextRole}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="admin-modal-cancel-btn flex-1">
            Cancel
          </button>
          <button onClick={onConfirm} className="admin-btn-primary flex-1 justify-center">
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
}
