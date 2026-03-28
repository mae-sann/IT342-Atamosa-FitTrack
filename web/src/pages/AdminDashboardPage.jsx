import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/dashboard.css';
import '../styles/admin.css';

// Icon components
const UserIcon = () => (
  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const WorkoutIcon = () => (
  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const ExerciseIcon = () => (
  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const ActiveIcon = () => (
  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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

const EXERCISE_CATEGORIES = ['Upper Body', 'Lower Body', 'Core', 'Cardio'];

const normalizeResponseItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const getRoleBadgeClass = (role) =>
  role === 'ADMIN' ? 'bg-red-600/20 text-red-300' : 'bg-blue-600/20 text-blue-300';

const getCategoryBadgeClass = (category = '') => {
  const value = category.toLowerCase();
  if (value.includes('upper')) return 'bg-blue-600/20 text-blue-300';
  if (value.includes('lower') || value.includes('leg')) return 'bg-emerald-600/20 text-emerald-300';
  if (value.includes('core') || value.includes('abs')) return 'bg-purple-600/20 text-purple-300';
  if (value.includes('cardio')) return 'bg-red-600/20 text-red-300';
  return 'bg-slate-600/20 text-slate-300';
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [userSearch, setUserSearch] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [usersPerPage] = useState(5);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    muscle_group: '',
    description: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [meResponse, usersResponse, exercisesResponse] = await Promise.all([
        authService.getCurrentUser(),
        authService.getAllUsers(),
        authService.getExercises(),
      ]);

      setCurrentUser(meResponse.data);
      setUsers(normalizeResponseItems(usersResponse.data));
      setExercises(normalizeResponseItems(exercisesResponse.data));
    } catch (requestError) {
      if (requestError.response?.status === 401 || requestError.response?.status === 403) {
        await authService.logout();
        navigate('/login');
        return;
      }
      setError(requestError.response?.data?.message || 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
      return fullName.includes(query) || (user.email || '').toLowerCase().includes(query);
    });
  }, [userSearch, users]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (userPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, userPage, usersPerPage]);

  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);

  const filteredExercises = useMemo(() => {
    const query = exerciseSearch.trim().toLowerCase();
    if (!query) return exercises;
    return exercises.filter((exercise) =>
      (exercise.name || '').toLowerCase().includes(query) ||
      (exercise.muscle_group || '').toLowerCase().includes(query)
    );
  }, [exerciseSearch, exercises]);

  const userInitials = useMemo(() => {
    const fullName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim();
    if (!fullName) return 'AD';
    return fullName
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }, [currentUser]);

  const openCreateModal = () => {
    setEditingExerciseId(null);
    setExerciseForm({ name: '', muscle_group: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (exercise) => {
    setEditingExerciseId(exercise.id);
    setExerciseForm({
      name: exercise.name || '',
      muscle_group: exercise.muscle_group || '',
      description: exercise.description || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingExerciseId(null);
    setExerciseForm({ name: '', muscle_group: '', description: '' });
  };

  const handleSaveExercise = async () => {
    if (!exerciseForm.name.trim() || !exerciseForm.muscle_group.trim()) {
      setError('Exercise name and category are required.');
      return;
    }

    try {
      setError('');
      const payload = {
        name: exerciseForm.name.trim(),
        muscle_group: exerciseForm.muscle_group.trim(),
        description: exerciseForm.description.trim(),
      };

      if (editingExerciseId) {
        await authService.updateExercise(editingExerciseId, payload);
        setSuccess('Exercise updated successfully.');
      } else {
        await authService.createExercise(payload);
        setSuccess('Exercise added successfully.');
      }

      closeModal();
      const exercisesResponse = await authService.getExercises();
      setExercises(normalizeResponseItems(exercisesResponse.data));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save exercise.');
    }
  };

  const handleDeleteExercise = async (exercise) => {
    const confirmed = window.confirm(`Delete exercise "${exercise.name}"?`);
    if (!confirmed) return;

    try {
      setError('');
      await authService.deleteExercise(exercise.id);
      setSuccess('Exercise deleted successfully.');
      setExercises((previous) => previous.filter((item) => item.id !== exercise.id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete exercise.');
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Delete user ${user.email}?`);
    if (!confirmed) return;

    try {
      setError('');
      await authService.deleteUser(user.id);
      setSuccess('User deleted successfully.');
      setUsers((previous) => previous.filter((item) => item.id !== user.id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0F1E] text-white">
      <aside className="sidebar flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="bebas text-2xl tracking-wider text-white">FitTrack</span>
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-red-600/20 text-red-300 text-xs font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
            Admin Panel
          </div>
        </div>

        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold text-sm">{userInitials}</div>
            <div>
              <div className="text-sm font-semibold">{`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Admin User'}</div>
              <div className="text-xs text-gray-500">{currentUser?.email || 'admin@fittrack.com'}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2">Admin</p>
          <Link to="/admin" className="nav-item active">
            <DashboardIcon />
            Dashboard
          </Link>
          <button onClick={() => setActiveTab('users')} className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Management
          </button>
          <button onClick={() => setActiveTab('exercises')} className={`nav-item ${activeTab === 'exercises' ? 'active' : ''}`}>
            <ExerciseIcon />
            Exercise Management
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="nav-item text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full text-left">
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 bg-[#0A0F1E]/80 backdrop-blur border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">System overview and management</p>
          </div>
          <span className="text-xs bg-red-600/20 text-red-300 font-bold px-3 py-1.5 rounded-full">🔐 Admin Mode</span>
        </div>

        <div className="p-8">
          {(error || success) && (
            <div className={`mb-6 rounded-xl px-4 py-3 text-sm border ${error ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>
              {error || success}
            </div>
          )}

          {/* Stats Cards - Matching Claude's Design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center mb-3">
                <UserIcon />
              </div>
              <div className="text-2xl font-black text-white">{users.length}</div>
              <div className="text-xs text-gray-400 mt-1">Total Users</div>
              <div className="text-xs text-emerald-400 mt-1">+{Math.max(0, users.length - 5)} this week</div>
            </div>

            <div className="stat-card">
              <div className="w-9 h-9 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-3">
                <WorkoutIcon />
              </div>
              <div className="text-2xl font-black text-white">48,291</div>
              <div className="text-xs text-gray-400 mt-1">Total Workouts</div>
              <div className="text-xs text-emerald-400 mt-1">+341 today</div>
            </div>

            <div className="stat-card">
              <div className="w-9 h-9 bg-purple-600/20 rounded-xl flex items-center justify-center mb-3">
                <ExerciseIcon />
              </div>
              <div className="text-2xl font-black text-white">{exercises.length}</div>
              <div className="text-xs text-gray-400 mt-1">Total Exercises</div>
              <div className="text-xs text-gray-500 mt-1">Across {EXERCISE_CATEGORIES.length} categories</div>
            </div>

            <div className="stat-card">
              <div className="w-9 h-9 bg-orange-600/20 rounded-xl flex items-center justify-center mb-3">
                <ActiveIcon />
              </div>
              <div className="text-2xl font-black text-white">{Math.round((users.filter(u => u.role !== 'ADMIN').length / (users.length || 1)) * 100) || 0}%</div>
              <div className="text-xs text-gray-400 mt-1">Active Today</div>
              <div className="text-xs text-emerald-400 mt-1">{users.filter(u => u.role !== 'ADMIN').length} regular users</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1.5 rounded-xl w-fit border border-white/10">
            <button onClick={() => setActiveTab('users')} className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}>
              👤 User Management
            </button>
            <button onClick={() => setActiveTab('exercises')} className={`admin-tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}>
              🏋️ Exercise Management
            </button>
          </div>

          {/* USER MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="font-bold text-white">Registered Users</h2>
                <div className="relative">
                  <SearchIcon />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
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
                    {paginatedUsers.map((user, index) => {
                      const isSelf = user.id === currentUser?.id;
                      const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
                      const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : 'N/A';
                      return (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="px-5 py-3 text-sm text-gray-500 font-mono">#{String(index + 1).padStart(3, '0')}</td>
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
                          <td className="px-5 py-3 text-sm text-gray-400">—</td>
                          <td className="px-5 py-3 text-sm text-gray-400">{joinDate}</td>
                          <td className="px-5 py-3">
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">
                              Active
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2">
                              <button className="admin-action-btn bg-blue-600/20 text-blue-300 hover:bg-blue-600/30">
                                <EditIcon />
                                Edit
                              </button>
                              <button
                                disabled={isSelf}
                                onClick={() => handleDeleteUser(user)}
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
                <span className="text-sm text-gray-400">Showing {paginatedUsers.length} of {filteredUsers.length} users</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setUserPage(Math.max(1, userPage - 1))}
                    disabled={userPage === 1}
                    className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ←
                  </button>
                  {Array.from({ length: Math.min(totalUserPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setUserPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                        userPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalUserPages > 5 && <span className="px-2 text-gray-500">...</span>}
                  <button
                    onClick={() => setUserPage(Math.min(totalUserPages, userPage + 1))}
                    disabled={userPage === totalUserPages}
                    className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EXERCISE MANAGEMENT TAB */}
          {activeTab === 'exercises' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">Exercise Library Management</h2>
                <button className="admin-btn-primary flex items-center gap-2" onClick={openCreateModal}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
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
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
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
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Exercise Name</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExercises.map((exercise) => (
                        <tr key={exercise.id} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="px-5 py-3 text-sm font-semibold text-white">{exercise.name}</td>
                          <td className="px-5 py-3">
                            <span className={`admin-badge ${getCategoryBadgeClass(exercise.muscle_group)}`}>
                              {exercise.muscle_group || 'General'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-400 max-w-xs truncate">{exercise.description || 'No description available.'}</td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => openEditModal(exercise)} className="admin-action-btn bg-blue-600/20 text-blue-300 hover:bg-blue-600/30">
                                <EditIcon />
                                Edit
                              </button>
                              <button onClick={() => handleDeleteExercise(exercise)} className="admin-action-btn bg-red-600/10 text-red-400 hover:bg-red-600/20">
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
                  <span className="text-sm text-gray-400">Showing {filteredExercises.length} of {exercises.length} exercises</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-bg" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editingExerciseId ? 'Edit Exercise' : 'Add New Exercise'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition text-2xl leading-none">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Exercise Name</label>
                <input
                  type="text"
                  value={exerciseForm.name}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                  className="admin-input-field"
                  placeholder="e.g., Incline Dumbbell Press"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                <select
                  value={exerciseForm.muscle_group}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, muscle_group: e.target.value })}
                  className="admin-input-field"
                >
                  <option value="">Select category</option>
                  {EXERCISE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={exerciseForm.description}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })}
                  className="admin-input-field"
                  placeholder="Brief description of the exercise..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition font-semibold text-sm">
                Cancel
              </button>
              <button onClick={handleSaveExercise} className="admin-btn-primary flex-1 py-3">
                Save Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}