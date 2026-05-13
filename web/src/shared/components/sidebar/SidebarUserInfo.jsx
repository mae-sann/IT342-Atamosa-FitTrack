function getEmailPrefix(email) {
  if (!email) return 'User';
  const prefix = email.split('@')[0];
  return prefix.replace(/[._-]/g, ' ').trim() || 'User';
}

function getDisplayName(user) {
  const resolvedUser = user?.data && typeof user.data === 'object' ? user.data : user;
  if (!resolvedUser) return 'Loading...';
  const fullName = `${resolvedUser.firstName || ''} ${resolvedUser.lastName || ''}`.trim();
  return fullName || resolvedUser.name || getEmailPrefix(resolvedUser.email) || 'User';
}

function getInitials(user) {
  const resolvedUser = user?.data && typeof user.data === 'object' ? user.data : user;
  const fullName = `${resolvedUser?.firstName || ''} ${resolvedUser?.lastName || ''}`.trim() || resolvedUser?.name || getEmailPrefix(resolvedUser?.email) || '';
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
  const resolvedUser = user?.data && typeof user.data === 'object' ? user.data : user;

  return (
    <div className="px-4 py-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${accentClass} rounded-full flex items-center justify-center font-bold text-sm`}>
          {getInitials(user)}
        </div>
        <div>
          <div className="text-sm font-semibold">{getDisplayName(user)}</div>
          <div className="text-xs text-gray-500">{resolvedUser?.email || ''}</div>
        </div>
      </div>
    </div>
  );
}
