import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/authService';
import LogoutConfirmDialog from '../components/LogoutConfirmDialog';
import '../styles/dashboard.css';

function getCategoryStyle(muscleGroup) {
  const group = muscleGroup?.toLowerCase() || '';
  if (group.includes('upper')) return { bg: 'bg-blue-600/20', text: 'text-blue-300', label: 'Upper Body' };
  if (group.includes('lower')) return { bg: 'bg-emerald-600/20', text: 'text-emerald-300', label: 'Lower Body' };
  if (group.includes('core')) return { bg: 'bg-purple-600/20', text: 'text-purple-300', label: 'Core' };
  if (group.includes('cardio')) return { bg: 'bg-red-600/20', text: 'text-red-300', label: 'Cardio' };
  return { bg: 'bg-gray-600/20', text: 'text-gray-300', label: 'General' };
}

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

function formatRelativeDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return '';
}

function isInDateFilter(workoutDate, filter) {
  if (filter === 'All Time') return true;
  const date = new Date(workoutDate);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  if (filter === 'This Week') {
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() + mondayOffset);
    return date >= weekStart;
  }

  if (filter === 'This Month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  if (filter === 'Last Month') {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
  }

  return true;
}

function getDisplayName(user) {
  if (!user) return 'Athlete';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName || user.name || 'Athlete';
}

function toWorkoutName(logs = []) {
  if (!logs.length) return 'Workout Session';
  if (logs.length === 1) return logs[0].exerciseName;
  return `${logs[0].exerciseName} +${logs.length - 1} more`;
}

function inferCategoryFromExerciseName(exerciseName) {
  const value = (exerciseName || '').toLowerCase();
  if (/(run|jog|cycling|bike|jump rope|rope|burpee|cardio)/.test(value)) return 'Cardio';
  if (/(bench|push|pull|row|press|curl|dip|tricep|bicep|shoulder|chest|lat)/.test(value)) return 'Upper Body';
  if (/(squat|deadlift|lunge|leg|calf|hamstring|glute)/.test(value)) return 'Lower Body';
  if (/(plank|crunch|core|ab|abs|twist|sit-up|sit up|russian twist)/.test(value)) return 'Core';
  return 'General';
}

function normalizeCategory(muscleGroup, exerciseName) {
  const value = (muscleGroup || '').toLowerCase();
  if (value.includes('cardio')) return 'Cardio';
  if (value.includes('upper')) return 'Upper Body';
  if (value.includes('lower')) return 'Lower Body';
  if (value.includes('core')) return 'Core';

  return inferCategoryFromExerciseName(exerciseName);
}

function getPrimaryWorkoutCategory(logs = []) {
  if (!logs.length) return 'General';

  const counts = logs.reduce((accumulator, log) => {
    const category = normalizeCategory(log.muscleGroup, log.exerciseName);
    if (category !== 'General') {
      accumulator[category] = (accumulator[category] || 0) + 1;
    }
    return accumulator;
  }, {});

  const ranked = Object.entries(counts).sort((left, right) => right[1] - left[1]);
  return ranked.length ? ranked[0][0] : 'General';
}

const PAGE_SIZE = 10;

export default function WorkoutHistory() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [detailCache, setDetailCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [toastVisible, setToastVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (!toastVisible) return undefined;
    const timer = setTimeout(() => setToastVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [userResponse, workoutsResponse] = await Promise.all([
        authService.getCurrentUser(),
        api.get('/api/workouts'),
      ]);

      setUser(userResponse.data);
      const items = Array.isArray(workoutsResponse.data) 
        ? workoutsResponse.data 
        : Array.isArray(workoutsResponse.data?.items) 
          ? workoutsResponse.data.items 
          : [];
      setWorkouts(items);
    } catch (requestError) {
      setError('Failed to load workout history. Please try again.');
      if (requestError?.response?.status === 401 || requestError?.response?.status === 403) {
        authService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadWorkoutDetail = async (workoutId) => {
    if (detailCache[workoutId]) return detailCache[workoutId];

    try {
      const response = await api.get(`/api/workouts/${workoutId}`);
      const detail = response.data?.item || response.data;
      setDetailCache((prev) => ({ ...prev, [workoutId]: detail }));
      return detail;
    } catch {
      return null;
    }
  };

  const filteredWorkouts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return workouts.filter((workout) => {
      if (!isInDateFilter(workout.workoutDate, dateFilter)) return false;

      if (!query) return true;

      const workoutName = workout.title || toWorkoutName(workout.logs || []);
      const exerciseText = (workout.logs || []).map((log) => log.exerciseName).join(' ').toLowerCase();
      const dateText = formatDisplayDate(workout.workoutDate).toLowerCase();
      return workoutName.toLowerCase().includes(query) || exerciseText.includes(query) || dateText.includes(query);
    });
  }, [workouts, dateFilter, searchQuery, detailCache]);

  const totalPages = Math.max(1, Math.ceil(filteredWorkouts.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedWorkouts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredWorkouts.slice(start, start + PAGE_SIZE);
  }, [filteredWorkouts, currentPage]);

  useEffect(() => {
    const missingIds = pagedWorkouts
      .map((workout) => workout.id)
      .filter((id) => !detailCache[id]);

    if (!missingIds.length) return;

    let cancelled = false;

    Promise.all(
      missingIds.map(async (id) => {
        try {
          const response = await api.get(`/api/workouts/${id}`);
          return { id, detail: response.data?.item || response.data };
        } catch {
          return { id, detail: null };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      setDetailCache((prev) => {
        const next = { ...prev };
        results.forEach(({ id, detail }) => {
          if (detail) next[id] = detail;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [pagedWorkouts]);

  const selectedWorkoutDetail = selectedWorkoutId ? detailCache[selectedWorkoutId] : null;
  const selectedWorkoutLogs = selectedWorkoutDetail?.logs || [];
  const selectedWorkoutCategory = getPrimaryWorkoutCategory(selectedWorkoutLogs);

  const stats = useMemo(() => {
    const totalWorkouts = workouts.length;
    const totalExercises = workouts.reduce((sum, workout) => sum + (workout.totalExercises || 0), 0);
    return {
      totalWorkouts,
      totalExercises,
      totalTime: '--',
    };
  }, [workouts]);

  const fullName = getDisplayName(user);
  const userInitials = fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'A';

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

  const handleViewWorkout = async (workoutId) => {
    try {
      setModalOpen(true);
      setSelectedWorkoutId(workoutId);
      setModalLoading(true);
      await loadWorkoutDetail(workoutId);
    } catch {
      showToast('Failed to load workout details.', 'error');
      setModalOpen(false);
      setSelectedWorkoutId(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditWorkout = async (workout) => {
    const detail = await loadWorkoutDetail(workout.id);
    if (!detail) {
      showToast('Failed to load workout for editing.', 'error');
      return;
    }

    navigate('/create-workout', {
      state: {
        prefillWorkout: {
          id: detail.id,
          title: detail.title || workout.title,
          workoutDate: detail.workoutDate,
          logs: Array.isArray(detail.logs)
            ? detail.logs.map((log) => ({
                exerciseName: log.exerciseName,
                muscleGroup: log.muscleGroup,
                sets: log.sets,
                reps: log.reps,
              }))
            : [],
        },
      },
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedWorkoutId(null);
    setModalLoading(false);
  };

  const handleDeleteWorkout = async (workoutId) => {
    const confirmed = window.confirm('Delete this workout? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await api.delete(`/api/workouts/${workoutId}`);
      setWorkouts((prev) => prev.filter((workout) => workout.id !== workoutId));
      setDetailCache((prev) => {
        const next = { ...prev };
        delete next[workoutId];
        return next;
      });
      showToast('Workout deleted successfully.', 'success');
    } catch {
      showToast('Failed to delete workout.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading workout history...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0F1E] text-white">
      <aside className="sidebar flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="bebas text-2xl tracking-wider text-white">FitTrack</span>
          </Link>
        </div>

        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{userInitials}</div>
            <div>
              <div className="text-sm font-semibold">{fullName}</div>
              <div className="text-xs text-gray-500">{user?.email || 'user@example.com'}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2">Main</p>
          <Link to="/dashboard" className="nav-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>
          <Link to="/exercises" className="nav-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Exercise Library
          </Link>
          <Link to="/create-workout" className="nav-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Workout
          </Link>
          <Link to="/workout-history" className="nav-item active">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Workout History
          </Link>
          <Link to="/goals" className="nav-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Goals
          </Link>

          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2 mt-4">Account</p>
          <Link to="/profile" className="nav-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto">
          <button onClick={handleLogout} className="nav-item nav-item--logout w-full text-left">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 bg-[#0A0F1E]/80 backdrop-blur border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Workout History</h1>
            <p className="text-sm text-gray-500">All your logged workout sessions</p>
          </div>
          <Link to="/create-workout" className="dashboard-primary-button text-sm px-5 py-2.5 rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            New Workout
          </Link>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between gap-4">
              <span>{error}</span>
              <button onClick={loadData} className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-1.5 rounded-lg transition">
                Retry
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-white">{stats.totalWorkouts}</div>
              <div className="text-xs text-gray-400 mt-1">Total Workouts</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-white">{stats.totalExercises}</div>
              <div className="text-xs text-gray-400 mt-1">Exercises Done</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-white">{stats.totalTime}</div>
              <div className="text-xs text-gray-400 mt-1">Total Time</div>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 text-sm outline-none focus:border-blue-600 transition"
              />
            </div>
            <select
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-600 transition"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '16px' }}
            >
              <option className="bg-[#0A0F1E] text-white">All Time</option>
              <option className="bg-[#0A0F1E] text-white">This Week</option>
              <option className="bg-[#0A0F1E] text-white">This Month</option>
              <option className="bg-[#0A0F1E] text-white">Last Month</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Workout Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Exercises</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedWorkouts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-sm text-gray-400">
                        No workouts found for your current filter.
                      </td>
                    </tr>
                  ) : (
                    pagedWorkouts.map((workout, index) => {
                      const logs = workout.logs || detailCache[workout.id]?.logs || [];
                      const workoutCategory = getPrimaryWorkoutCategory(logs);
                      const categoryStyle = getCategoryStyle(workoutCategory);
                      const workoutName = workout.title || (logs.length ? toWorkoutName(logs) : `Workout #${workout.id}`);
                      const exerciseNames = logs.map((log) => log.exerciseName).join(' · ');

                      return (
                        <tr key={workout.id} className="border-b border-white/10 hover:bg-blue-600/5 transition">
                          <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                            {workouts.length - ((currentPage - 1) * PAGE_SIZE + index)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">{workoutName}</td>
                          <td className="px-4 py-3">
                            <div className="text-gray-300">{formatDisplayDate(workout.workoutDate)}</div>
                            {formatRelativeDate(workout.workoutDate) && (
                              <div className="text-xs text-gray-500">{formatRelativeDate(workout.workoutDate)}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400 max-w-[300px]">
                            <div className="leading-5 break-words">{exerciseNames || 'No exercises'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.text}`}>
                              {categoryStyle.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 wh-actions">
                              <button
                                onClick={() => handleViewWorkout(workout.id)}
                                className="wh-action-btn wh-action-btn--view"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleEditWorkout(workout)}
                                className="wh-action-btn wh-action-btn--edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteWorkout(workout.id)}
                                className="wh-action-btn wh-action-btn--delete"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-4 border-t border-white/10">
              <span className="text-sm text-gray-400">
                Showing {pagedWorkouts.length} of {filteredWorkouts.length} workouts
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        isProcessing={isLoggingOut}
      />

      {/* View Workout Modal */}
{modalOpen && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={closeModal}>
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">
          {selectedWorkoutDetail ? (selectedWorkoutDetail.title || toWorkoutName(selectedWorkoutLogs)) : 'Workout Details'}
        </h2>
        <button 
          onClick={closeModal} 
          className="!bg-red-600/20 !text-red-400 hover:!bg-red-600/30 hover:!text-red-300 transition-all duration-200 text-xl leading-none w-7 h-7 flex items-center justify-center rounded-full"
        >
          ×
        </button>
      </div>

      {modalLoading ? (
        <div className="text-sm text-gray-400">Loading workout details...</div>
      ) : selectedWorkoutDetail ? (
        <>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Workout Name</span>
              <span className="text-white font-medium">{selectedWorkoutDetail.title || 'Workout Session'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Date</span>
              <span className="text-white font-medium">{formatDisplayDate(selectedWorkoutDetail.workoutDate)}</span>
            </div>
            <div className="flex justify-between items-start text-sm gap-4">
              <span className="text-gray-400">Category</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getCategoryStyle(selectedWorkoutCategory).bg} ${getCategoryStyle(selectedWorkoutCategory).text}`}>
                {getCategoryStyle(selectedWorkoutCategory).label}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Exercises</span>
              <span className="text-white font-medium">{selectedWorkoutLogs.length}</span>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Exercises Performed</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {selectedWorkoutLogs.map((log, idx) => (
              <div key={idx} className="flex justify-between text-sm py-2 border-b border-white/10">
                <div>
                  <span className="text-white">{log.exerciseName}</span>
                  <div className="text-xs text-gray-500">{log.muscleGroup || 'General'}</div>
                </div>
                <span className="text-gray-400">{log.sets} sets × {log.reps} reps</span>
              </div>
            ))}
          </div>

          <button onClick={closeModal} className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition">
            Close
          </button>
        </>
      ) : (
        <div className="text-sm text-red-300">Workout details not available.</div>
      )}
    </div>
  </div>
)}

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg transition-all duration-300 ${
          toastVisible
            ? toastType === 'error'
              ? 'translate-y-0 opacity-100 bg-red-600'
              : 'translate-y-0 opacity-100 bg-blue-600'
            : 'translate-y-20 opacity-0'
        }`}
      >
        {toastMessage}
      </div>
    </div>
  );
}