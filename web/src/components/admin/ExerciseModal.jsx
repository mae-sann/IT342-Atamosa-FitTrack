const CATEGORIES = ['Upper Body', 'Lower Body', 'Core', 'Cardio'];

export default function ExerciseModal({
  isOpen,
  isSaving,
  isEditing,
  form,
  setForm,
  onClose,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-bg">
      <div className="admin-modal w-full" style={{ maxWidth: '480px' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{isEditing ? 'Edit Exercise' : 'Add New Exercise'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition text-2xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Exercise Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="e.g., Incline Dumbbell Press"
              className="admin-input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
            <select
              value={form.muscle_group}
              onChange={(event) => setForm((prev) => ({ ...prev, muscle_group: event.target.value }))}
              className="admin-input-field"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows="3"
              placeholder="Brief description of the exercise..."
              className="admin-input-field"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="admin-btn-primary flex-1 py-3 justify-center"
          >
            {isSaving ? 'Saving...' : 'Save Exercise'}
          </button>
        </div>
      </div>
    </div>
  );
}
