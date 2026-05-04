function formatDisplayDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ConfirmWorkoutDeleteModal({
  isOpen,
  workout,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !workout) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Delete Workout</h2>
          <button
            onClick={onClose}
            className="!bg-red-600/20 !text-red-400 hover:!bg-red-600/30 hover:!text-red-300 transition-all duration-200 text-xl leading-none w-7 h-7 flex items-center justify-center rounded-full"
            aria-label="Close delete workout modal"
          >
            ×
          </button>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-5">
          <p className="text-sm text-red-200 font-semibold">This action cannot be undone.</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-400">Workout Name</span>
            <span className="text-white font-medium text-right">{workout.title || 'Workout Session'}</span>
          </div>
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-400">Date</span>
            <span className="text-white font-medium text-right">{formatDisplayDate(workout.workoutDate)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-full !bg-white/5 !text-gray-300 hover:!bg-white/10 hover:!text-white !border !border-white/10 !rounded-xl !py-3 !px-4 !font-semibold !text-sm !transition-all !duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full !bg-red-600/20 !text-red-300 hover:!bg-red-600/30 hover:!text-red-200 !border !border-red-500/30 !rounded-xl !py-3 !px-4 !font-bold !text-sm !transition-all !duration-200"
          >
            Delete Workout
          </button>
        </div>
      </div>
    </div>
  );
}
