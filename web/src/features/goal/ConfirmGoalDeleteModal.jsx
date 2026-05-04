export default function ConfirmGoalDeleteModal({
  isOpen,
  goal,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !goal) return null;

  return (
    <div
      className="modal-overlay open"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-box" style={{ maxWidth: '500px' }}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="text-lg font-bold text-white leading-tight">Delete Goal</h2>
          <button type="button" onClick={onClose} className="modal-close modal-close--danger" aria-label="Close delete goal modal">
            ×
          </button>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-5">
          <p className="text-sm text-red-200 font-semibold">This action cannot be undone.</p>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/4 p-4 mb-6">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-gray-400">Goal</span>
            <span className="text-white font-semibold text-right">{goal.goal_text || 'Fitness Goal'}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger flex-1">
            Delete Goal
          </button>
        </div>
      </div>
    </div>
  );
}
