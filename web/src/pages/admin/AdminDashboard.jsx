import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { authService } from '../../services/authService';
import adminService from '../../services/adminService';

import StatsCards from '../../components/admin/StatsCards';
import UserTable from '../../components/admin/UserTable';
import ExerciseTable from '../../components/admin/ExerciseTable';
import ExerciseModal from '../../components/admin/ExerciseModal';

import '../../styles/dashboard.css';
import '../../styles/admin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [savingExercise, setSavingExercise] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisWeek: 0,
    totalWorkouts: 0,
    workoutsToday: 0,
    totalExercises: 0,
    categoryCount: 0,
    activeToday: 0,
    activePercentage: 0,
  });

  const [usersPage, setUsersPage] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
  });
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [userSize] = useState(10);

  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exercises, setExercises] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    muscle_group: '',
    description: '',
  });

  const loadStats = async () => {
    const data = await adminService.getStats();
    setStats(data);
  };

  const loadUsers = async (page = userPage, search = userSearch) => {
    const response = await adminService.getUsers({ page, size: userSize, search });
    setUsersPage({
      content: response.content || [],
      totalElements: response.totalElements || 0,
      totalPages: response.totalPages || 0,
    });
  };

  const loadExercises = async () => {
    const items = await adminService.getExercises();
    setExercises(items);
  };

  const loadCurrentUser = async () => {
    const response = await authService.getCurrentUser();
    setCurrentUser(response.data);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    setActiveTab(tab === 'exercises' ? 'exercises' : 'users');
  }, [location.search]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        setError('');

        await Promise.all([
          loadCurrentUser(),
          loadStats(),
          loadUsers(0, ''),
          loadExercises(),
        ]);
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

    loadAll();
  }, [navigate]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(''), 2500);
    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    const run = async () => {
      try {
        setError('');
        await loadUsers(userPage, userSearch);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Failed to load users.');
      }
    };

    if (!loading) {
      run();
    }
  }, [userPage, userSearch]);

  const filteredExercises = useMemo(() => {
    const query = exerciseSearch.trim().toLowerCase();
    if (!query) return exercises;

    return exercises.filter((exercise) =>
      (exercise.name || '').toLowerCase().includes(query) ||
      (exercise.muscle_group || exercise.muscleGroup || '').toLowerCase().includes(query)
    );
  }, [exerciseSearch, exercises]);

  const openCreateModal = () => {
    setEditingExerciseId(null);
    setExerciseForm({ name: '', muscle_group: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (exercise) => {
    setEditingExerciseId(exercise.id);
    setExerciseForm({
      name: exercise.name || '',
      muscle_group: exercise.muscle_group || exercise.muscleGroup || '',
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
      setSavingExercise(true);
      setError('');

      const payload = {
        name: exerciseForm.name.trim(),
        muscle_group: exerciseForm.muscle_group.trim(),
        description: exerciseForm.description.trim(),
      };

      if (editingExerciseId) {
        await adminService.updateExercise(editingExerciseId, payload);
        setSuccess('Exercise updated successfully.');
      } else {
        await adminService.createExercise(payload);
        setSuccess('Exercise added successfully.');
      }

      closeModal();
      await Promise.all([loadExercises(), loadStats()]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save exercise.');
    } finally {
      setSavingExercise(false);
    }
  };

  const handleDeleteExercise = async (exercise) => {
    const confirmed = window.confirm(`Delete exercise "${exercise.name}"?`);
    if (!confirmed) return;

    try {
      setError('');
      await adminService.deleteExercise(exercise.id);
      setSuccess('Exercise deleted successfully.');
      await Promise.all([loadExercises(), loadStats()]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete exercise.');
    }
  };

  const handleToggleUserRole = async (user) => {
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmed = window.confirm(`Change role of ${user.email} to ${nextRole}?`);
    if (!confirmed) return;

    try {
      setError('');
      await adminService.updateUserRole(user.id, nextRole);
      setSuccess('User role updated successfully.');
      await Promise.all([loadUsers(), loadStats()]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Delete user ${user.email}?`);
    if (!confirmed) return;

    try {
      setError('');
      await adminService.deleteUser(user.id);
      setSuccess('User deleted successfully.');
      await Promise.all([loadUsers(), loadStats()]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleUserSearchChange = (value) => {
    setUserSearch(value);
    setUserPage(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <>
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

          {/* Stats Cards - Increased bottom margin */}
          <div className="mb-10 md:mb-12">
            <StatsCards stats={stats} />
          </div>

          {/* Visual Separator Line */}
          <div className="border-t border-white/10 my-6"></div>

          {/* Tables with top margin */}
          <div className="mt-6">
            {activeTab === 'users' ? (
              <UserTable
                users={usersPage.content}
                totalElements={usersPage.totalElements}
                totalPages={usersPage.totalPages}
                page={userPage}
                search={userSearch}
                onSearchChange={handleUserSearchChange}
                onPageChange={setUserPage}
                onToggleRole={handleToggleUserRole}
                onDelete={handleDeleteUser}
                currentUserId={currentUser?.id}
              />
            ) : (
              <ExerciseTable
                exercises={filteredExercises}
                search={exerciseSearch}
                onSearchChange={setExerciseSearch}
                onAdd={openCreateModal}
                onEdit={openEditModal}
                onDelete={handleDeleteExercise}
              />
            )}
          </div>
        </div>
      </main>

      <ExerciseModal
        isOpen={modalOpen}
        isSaving={savingExercise}
        isEditing={Boolean(editingExerciseId)}
        form={exerciseForm}
        setForm={setExerciseForm}
        onClose={closeModal}
        onSave={handleSaveExercise}
      />
    </>
  );
}