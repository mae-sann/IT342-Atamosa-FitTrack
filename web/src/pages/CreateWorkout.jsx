import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import LogoutConfirmDialog from '../components/LogoutConfirmDialog';
import '../styles/dashboard.css';

function getCategoryStyle(muscleGroup) {
  const group = muscleGroup?.toLowerCase() || '';
  if (group.includes('upper')) return { bg: 'bg-blue-600/20', text: 'text-blue-300', label: 'Upper Body' };
  if (group.includes('lower')) return { bg: 'bg-emerald-600/20', text: 'text-emerald-300', label: 'Lower Body' };
  if (group.includes('core')) return { bg: 'bg-purple-600/20', text: 'text-purple-300', label: 'Core' };
  if (group.includes('cardio')) return { bg: 'bg-red-600/20', text: 'text-red-300', label: 'Cardio' };
  return { bg: 'bg-slate-600/20', text: 'text-slate-300', label: 'General' };
}

const toIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeExercises = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const getDisplayName = (currentUser) => {
  if (!currentUser) return 'Athlete';
  const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
  return fullName || currentUser.name || 'Athlete';
};

export default function CreateWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState(authUser || null);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(toIsoDate(new Date()));
  const [exercises, setExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [setsInput, setSetsInput] = useState(3);
  const [repsInput, setRepsInput] = useState(10);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (authUser) {
      setUser(authUser);
    } else if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, [authUser]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/api/exercises');
        const items = normalizeExercises(response.data).map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          muscleGroup: exercise.muscle_group ?? exercise.muscleGroup ?? 'General',
        }));
        setAvailableExercises(items);
      } catch {
        setError('Failed to load exercise library. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    const prefillWorkout = location.state?.prefillWorkout;
    if (!prefillWorkout || !Array.isArray(prefillWorkout.logs)) return;

    const parsedDate = prefillWorkout.workoutDate ? new Date(prefillWorkout.workoutDate) : new Date();
    const safeDate = Number.isNaN(parsedDate.getTime()) ? toIsoDate(new Date()) : toIsoDate(parsedDate);

    const prefilledExercises = prefillWorkout.logs.map((log, index) => ({
      id: `prefill-${prefillWorkout.id || 'workout'}-${index}-${Date.now()}`,
      exerciseName: log.exerciseName,
      muscleGroup: log.muscleGroup || 'General',
      sets: Number(log.sets) || 1,
      reps: Number(log.reps) || 1,
    }));

    setWorkoutName(prefillWorkout.title || '');
    setWorkoutDate(safeDate);
    setExercises(prefilledExercises);
    showToast('Workout loaded. You can update and save it as a new entry.');

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!toastVisible) return undefined;
    const timer = setTimeout(() => setToastVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const groupedExercises = useMemo(() => {
    const groups = {
      upper: [],
      lower: [],
      core: [],
      cardio: [],
      other: [],
    };

    availableExercises.forEach((exercise) => {
      const category = getCategoryStyle(exercise.muscleGroup).label;
      if (category === 'Upper Body') groups.upper.push(exercise);
      else if (category === 'Lower Body') groups.lower.push(exercise);
      else if (category === 'Core') groups.core.push(exercise);
      else if (category === 'Cardio') groups.cardio.push(exercise);
      else groups.other.push(exercise);
    });

    return groups;
  }, [availableExercises]);

  const displayName = getDisplayName(user);
  const userInitials = displayName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'A';

  const exerciseCountText = `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}`;

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleAddExercise = () => {
    setError('');

    const chosen = availableExercises.find((exercise) => String(exercise.id) === String(selectedExerciseId));
    if (!chosen) {
      setError('Please select an exercise first.');
      return;
    }

    if (Number(setsInput) < 1 || Number(repsInput) < 1) {
      setError('Sets and reps must be at least 1.');
      return;
    }

    setExercises((prev) => [
      ...prev,
      {
        id: `${chosen.id}-${Date.now()}`,
        exerciseName: chosen.name,
        muscleGroup: chosen.muscleGroup,
        sets: Number(setsInput),
        reps: Number(repsInput),
      },
    ]);

    setSelectedExerciseId('');
    setSetsInput(3);
    setRepsInput(10);
  };

  const handleUpdateExerciseValue = (id, field, value) => {
    const parsed = Number(value);
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === id
          ? {
              ...exercise,
              [field]: Number.isFinite(parsed) ? parsed : 0,
            }
          : exercise
      )
    );
  };

  const handleRemoveExercise = (id) => {
    setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

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

  const handleSaveWorkout = async () => {
    setError('');

    if (exercises.length === 0) {
      setError('Please add at least one exercise before saving.');
      return;
    }

    const hasInvalidLog = exercises.some((exercise) => Number(exercise.sets) < 1 || Number(exercise.reps) < 1);
    if (hasInvalidLog) {
      setError('Sets and reps must be greater than or equal to 1 for all exercises.');
      return;
    }

    const payload = {
      workoutName: workoutName.trim() || 'Workout Session',
      workoutDate: `${workoutDate}T00:00:00`,
      logs: exercises.map((exercise) => ({
        exerciseName: exercise.exerciseName,
        muscleGroup: exercise.muscleGroup,
        sets: Number(exercise.sets),
        reps: Number(exercise.reps),
      })),
    };

    try {
      setLoading(true);
      await api.post('/api/workouts', payload);
      showToast('Workout saved successfully!');
      setTimeout(() => {
        navigate('/workout-history');
      }, 900);
    } catch (requestError) {
      const backendMessage = requestError?.response?.data?.message;
      const validationErrors = requestError?.response?.data?.errors;
      const detailedValidation = validationErrors && typeof validationErrors === 'object'
        ? Object.values(validationErrors).join(' ')
        : '';

      setError(backendMessage || detailedValidation || 'Failed to save workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <div className="text-sm font-semibold">{displayName}</div>
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
          <Link to="/create-workout" className="nav-item active">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Workout
          </Link>
          <Link to="/workout-history" className="nav-item">
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
            <h1 className="text-xl font-bold text-white">Create New Workout</h1>
            <p className="text-sm text-gray-500">Build your session by selecting exercises and entering sets & reps</p>
          </div>
        </div>

        <div className="w-full max-w-4xl p-8 mx-auto">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Workout Details Card */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-base font-bold text-white mb-4">Workout Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Workout Name</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="e.g. Upper Body Blast"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Workout Date</label>
                <input
                  type="date"
                  className="input-field w-full"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Add Exercise Card */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Add Exercise</h2>
              <Link to="/exercises" className="text-xs text-blue-400 hover:text-blue-300 transition">Browse full library →</Link>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-400 mb-2">Select Exercise</label>
              <select
                className="input-field w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                disabled={loading}
                style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.06)' }}
              >
                <option value="" className="bg-[#0A0F1E] text-gray-400">-- Choose an exercise --</option>

                {groupedExercises.upper.length > 0 && (
                  <optgroup label="Upper Body" className="bg-[#0A0F1E] text-white">
                    {groupedExercises.upper.map((exercise) => (
                      <option key={exercise.id} value={exercise.id} className="bg-[#0A0F1E] text-white">
                        {exercise.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {groupedExercises.lower.length > 0 && (
                  <optgroup label="Lower Body" className="bg-[#0A0F1E] text-white">
                    {groupedExercises.lower.map((exercise) => (
                      <option key={exercise.id} value={exercise.id} className="bg-[#0A0F1E] text-white">
                        {exercise.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {groupedExercises.core.length > 0 && (
                  <optgroup label="Core" className="bg-[#0A0F1E] text-white">
                    {groupedExercises.core.map((exercise) => (
                      <option key={exercise.id} value={exercise.id} className="bg-[#0A0F1E] text-white">
                        {exercise.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {groupedExercises.cardio.length > 0 && (
                  <optgroup label="Cardio" className="bg-[#0A0F1E] text-white">
                    {groupedExercises.cardio.map((exercise) => (
                      <option key={exercise.id} value={exercise.id} className="bg-[#0A0F1E] text-white">
                        {exercise.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {groupedExercises.other.length > 0 && (
                  <optgroup label="General" className="bg-[#0A0F1E] text-white">
                    {groupedExercises.other.map((exercise) => (
                      <option key={exercise.id} value={exercise.id} className="bg-[#0A0F1E] text-white">
                        {exercise.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Sets</label>
                <input
                  type="number"
                  min="1"
                  className="input-field w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  value={setsInput}
                  onChange={(e) => setSetsInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Reps</label>
                <input
                  type="number"
                  min="1"
                  className="input-field w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                  value={repsInput}
                  onChange={(e) => setRepsInput(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleAddExercise}
              className="cw-btn cw-btn--add"
            >
              + Add Exercise
            </button>
          </div>

          {/* Exercises List Card */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Exercises in This Workout</h2>
              <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">{exerciseCountText}</span>
            </div>

            {exercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <div className="text-4xl mb-2">🏋️</div>
                <p>No exercises added yet. Select exercises above to build your workout.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((exercise) => {
                  const style = getCategoryStyle(exercise.muscleGroup);
                  return (
                    <div key={exercise.id} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 self-center ${style.bg} ${style.text}`}>
                        {(exercise.exerciseName || 'E').charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0 self-center">
                        <div className="font-semibold text-white text-sm truncate">{exercise.exerciseName}</div>
                        <div className={`text-xs ${style.text}`}>{style.label}</div>
                      </div>

                      <div className="flex items-start gap-3 flex-shrink-0 mt-2">
                        <div className="text-center">
                          <input
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(e) => handleUpdateExerciseValue(exercise.id, 'sets', e.target.value)}
                            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-center text-white text-sm outline-none focus:border-blue-600"
                          />
                          <div className="text-xs text-gray-500 mt-1">Sets</div>
                        </div>
                        <div className="text-gray-600 text-sm w-4 text-center">×</div>
                        <div className="text-center">
                          <input
                            type="number"
                            min="1"
                            value={exercise.reps}
                            onChange={(e) => handleUpdateExerciseValue(exercise.id, 'reps', e.target.value)}
                            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-center text-white text-sm outline-none focus:border-blue-600"
                          />
                          <div className="text-xs text-gray-500 mt-1">Reps</div>
                        </div>

                        <button
                          onClick={() => handleRemoveExercise(exercise.id)}
                          className="cw-btn cw-btn--remove"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="cw-btn cw-btn--cancel"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveWorkout}
              disabled={loading}
              className="cw-btn cw-btn--save"
            >
              {loading ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        </div>
      </main>

      <div
        className={`fixed bottom-6 right-6 z-50 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg transition-all duration-300 ${
          toastVisible ? 'translate-y-0 opacity-100 bg-blue-600' : 'translate-y-20 opacity-0 bg-blue-600'
        }`}
      >
        {toastMessage}
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