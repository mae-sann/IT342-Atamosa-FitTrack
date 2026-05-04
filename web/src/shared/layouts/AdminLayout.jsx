import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import LogoutConfirmDialog from '../components/LogoutConfirmDialog';
import SidebarLogo from '../components/sidebar/SidebarLogo';
import SidebarUserInfo from '../components/sidebar/SidebarUserInfo';
import SidebarLogoutButton from '../components/sidebar/SidebarLogoutButton';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function getActiveAdminKey(search) {
  const params = new URLSearchParams(search);
  const tab = params.get('tab');
  if (tab === 'users') return 'users';
  if (tab === 'exercises') return 'exercises';
  return 'admin-dashboard';
}   

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => getStoredUser());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const active = useMemo(() => getActiveAdminKey(location.search), [location.search]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch {
        setUser(getStoredUser());
      }
    };

    loadCurrentUser();
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0A0F1E] text-white">
      <aside className="sidebar flex flex-col h-screen sticky top-0">
        <SidebarLogo to="/dashboard" showAdminBadge />
        <SidebarUserInfo user={user} accent="red" />

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2">Admin</p>
          <Link to="/admin" className={`nav-item ${active === 'admin-dashboard' ? 'active' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Admin Dashboard
          </Link>
          <Link to="/admin?tab=users" className={`nav-item ${active === 'users' ? 'active' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Management
          </Link>
          <Link to="/admin?tab=exercises" className={`nav-item ${active === 'exercises' ? 'active' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Exercise Management
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto">
          <SidebarLogoutButton onClick={handleLogout} />
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        isProcessing={isLoggingOut}
      />
    </div>
  );
}
