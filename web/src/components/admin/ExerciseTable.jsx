const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

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
  return (
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
          <div className="relative" style={{ width: '260px' }}>
            <SearchIcon />
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search exercises..."
              className="admin-input-field pl-9"
              style={{ paddingLeft: '36px', width: '100%' }}
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
                      <button onClick={() => onEdit(exercise)} className="admin-action-btn bg-blue-600/20 text-blue-300 hover:bg-blue-600/30">
                        <EditIcon />
                        Edit
                      </button>
                      <button onClick={() => onDelete(exercise)} className="admin-action-btn bg-red-600/10 text-red-400 hover:bg-red-600/20">
                        <DeleteIcon />
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
  );
}
