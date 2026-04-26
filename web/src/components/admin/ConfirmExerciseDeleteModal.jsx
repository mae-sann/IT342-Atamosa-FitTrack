export default function ConfirmExerciseDeleteModal({
  isOpen,
  exercise,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !exercise) return null;

  const category = exercise.muscle_group || exercise.muscleGroup || 'General';

  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <div className="admin-modal w-full" style={{ maxWidth: '520px' }} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Confirm Delete Exercise</h2>
          <button onClick={onClose} className="admin-modal-close-btn" aria-label="Close delete exercise modal">×</button>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-5">
          <p className="text-sm text-red-200 font-semibold">This action cannot be undone.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 mb-6">
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-400">Exercise Name</span>
            <span className="text-white font-semibold text-right">{exercise.name || 'Unnamed Exercise'}</span>
          </div>
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-400">Category</span>
            <span className="text-white font-semibold text-right">{category}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="admin-modal-cancel-btn flex-1">
            Cancel
          </button>
          <button onClick={onConfirm} className="admin-modal-danger-btn flex-1">
            Delete Exercise
          </button>
        </div>
      </div>
    </div>
  );
}
