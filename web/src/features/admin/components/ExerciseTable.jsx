import { useState } from 'react';

import ConfirmExerciseDeleteModal from './ConfirmExerciseDeleteModal';

const getCategoryBadgeClass = (category = '') => {
  const value = category.toLowerCase();
  if (value.includes('upper')) return 'bg-blue-600/20 text-blue-300';
  if (value.includes('lower') || value.includes('leg')) return 'bg-emerald-600/20 text-emerald-300';
  if (value.includes('core') || value.includes('abs')) return 'bg-purple-600/20 text-purple-300';
  if (value.includes('cardio')) return 'bg-red-600/20 text-red-300';
  return 'bg-slate-600/20 text-slate-300';
};

export default function ExerciseTable({
  exercises,
  search,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [deleteModalExercise, setDeleteModalExercise] = useState(null);

  const handleConfirmDelete = () => {
    if (!deleteModalExercise) return;
    onDelete(deleteModalExercise);
    setDeleteModalExercise(null);
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Exercise Library Management</h2>
          <button className="admin-btn-primary flex items-center gap-2" onClick={onAdd}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add New Exercise
          </button>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <div style={{ width: '260px' }}>
              <input
                type="text"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search exercises..."
                className="admin-input-field"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Exercise Name</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => (
                  <tr key={exercise.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-5 py-3 text-sm text-gray-500 font-mono">EX{String(exercise.id).padStart(3, '0')}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-white">{exercise.name}</td>
                    <td className="px-5 py-3">
                      <span className={`admin-badge ${getCategoryBadgeClass(exercise.muscle_group || exercise.muscleGroup || '')}`}>
                        {exercise.muscle_group || exercise.muscleGroup || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 max-w-xs truncate">
                      {exercise.description || 'No description available'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => onEdit(exercise)} className="admin-action-btn admin-action-btn--edit">
                          Edit
                        </button>
                        <button onClick={() => setDeleteModalExercise(exercise)} className="admin-action-btn admin-action-btn--delete">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
            <span className="text-sm text-gray-400">Showing {exercises.length} exercises</span>
          </div>
        </div>
      </div>

      <ConfirmExerciseDeleteModal
        isOpen={Boolean(deleteModalExercise)}
        exercise={deleteModalExercise}
        onClose={() => setDeleteModalExercise(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
