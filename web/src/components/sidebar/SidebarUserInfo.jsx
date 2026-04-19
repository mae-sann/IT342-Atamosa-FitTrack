function getDisplayName(user) {
  if (!user) return 'Loading...';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName || user.name || 'Athlete';
}

function getInitials(user) {
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || '';
  if (!fullName) return '...';
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function SidebarUserInfo({ user, accent = 'blue' }) {
  const accentClass = accent === 'red' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className="px-4 py-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${accentClass} rounded-full flex items-center justify-center font-bold text-sm`}>
          {getInitials(user)}
        </div>
        <div>
          <div className="text-sm font-semibold">{getDisplayName(user)}</div>
          <div className="text-xs text-gray-500">{user?.email || ''}</div>
        </div>
      </div>
    </div>
  );
}
