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

const getRoleBadgeClass = (role) =>
  role === 'ADMIN' ? 'bg-red-600/20 text-red-300' : 'bg-blue-600/20 text-blue-300';

const formatJoinDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const pageNumbers = (currentPage, totalPages) => {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let page = start; page <= end; page += 1) pages.push(page);
  return pages;
};

export default function UserTable({
  users,
  totalElements,
  totalPages,
  page,
  search,
  onSearchChange,
  onPageChange,
  onToggleRole,
  onDelete,
  currentUserId,
}) {
  const currentPage = page + 1;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h2 className="font-bold text-white">Registered Users</h2>
        <div className="relative">
          <SearchIcon />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search users..."
            className="admin-input-field pl-9"
            style={{ width: 220, paddingLeft: '36px' }}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Workouts</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';

              return (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-5 py-3 text-sm text-gray-500 font-mono">{String(user.id).padStart(3, '0')}</td>
                  <td className="px-5 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">{initials}</div>
                      <span className="font-medium text-white">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`admin-badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-white font-medium">{user.workoutCount || 0}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{formatJoinDate(user.createdAt)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-emerald-600/20 text-emerald-300' : 'bg-yellow-600/20 text-yellow-300'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => onToggleRole(user)} className="admin-action-btn bg-blue-600/20 text-blue-300 hover:bg-blue-600/30" title={`Change role to ${user.role === 'ADMIN' ? 'USER' : 'ADMIN'}`}>
                        <EditIcon />
                        Edit
                      </button>
                      <button
                        disabled={isSelf}
                        onClick={() => onDelete(user)}
                        className={`admin-action-btn ${isSelf ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-red-600/10 text-red-400 hover:bg-red-600/20'}`}
                      >
                        <DeleteIcon />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
        <span className="text-sm text-gray-400">Showing {users.length} of {totalElements} users</span>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ←
          </button>

          {pageNumbers(currentPage, totalPages).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber - 1)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                currentPage === pageNumber ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1 || totalPages === 0}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
