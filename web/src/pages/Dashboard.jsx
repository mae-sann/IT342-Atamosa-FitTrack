import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import WorkoutCard from '../components/WorkoutCard';
import { useWorkouts } from '../context/WorkoutContext';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { workouts, isLoading } = useWorkouts();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userResponse = await authService.getCurrentUser();
      setUser(userResponse.data);
    } catch (err) {
      setError('Failed to load user data');
      // Redirect to login if unauthorized
      if (err.response?.status === 401 || err.response?.status === 403) {
        authService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-container"><div className="loading">Loading...</div></div>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <div className="min-h-screen bg-[#0A0F1E] text-white p-6">User not found</div>;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const emoji = hour < 12 ? '👋' : '💪';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Athlete';
  const firstName = fullName.split(' ')[0];
  const userInitials = fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  const displayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex min-h-screen bg-[#0A0F1E] text-white">
      <aside className="sidebar flex flex-col">
        <div className="p-6 border-b border-white/5">
          <a href="#" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="bebas text-2xl tracking-wider text-white">FitTrack</span>
          </a>
        </div>

        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{userInitials}</div>
            <div>
              <div className="text-sm font-semibold">{fullName}</div>
              <div className="text-xs text-gray-500">{user.email || 'user@example.com'}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2">Main</p>
          <Link to="/dashboard" className="nav-item active">
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
          {user.role === 'ADMIN' && (
            <Link to="/admin" className="nav-item">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4v6h8v-6c0-2.21-1.79-4-4-4zM7 10V7a5 5 0 0110 0v3" />
              </svg>
              Admin Dashboard
            </Link>
          )}
          <Link to="/create-workout" className="nav-item">
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
          <a href="/goals" className="nav-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Goals
          </a>

          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2 mt-4">Account</p>
          <Link to="/profile" className="nav-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="nav-item text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full text-left">
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
            <h1 className="text-xl font-bold text-white">{greeting}, {firstName}! {emoji}</h1>
            <p className="text-sm text-gray-500">{displayDate}</p>
          </div>
          <Link to="/create-workout" className="dashboard-primary-button text-white text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            New Workout
          </Link>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-xs text-green-400 font-semibold bg-green-400/10 px-2 py-1 rounded-full">+3 this week</span>
              </div>
              <div className="text-3xl font-black text-white mb-1">28</div>
              <div className="text-sm text-gray-400">Workouts Completed</div>
              <div className="mt-auto pt-3">
                <div className="progress-bar"><div className="progress-fill" style={{ width: '70%' }} /></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
                <span className="text-xs text-orange-400 font-semibold bg-orange-400/10 px-2 py-1 rounded-full">🔥 Streak!</span>
              </div>
              <div className="text-3xl font-black text-white mb-1">14</div>
              <div className="text-sm text-gray-400">Active Days Streak</div>
              <div className="mt-auto pt-3">
                <div className="progress-bar"><div className="progress-fill" style={{ width: '47%', background: '#f97316' }} /></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-1 rounded-full">2 active</span>
              </div>
              <div className="text-3xl font-black text-white mb-1">3/5</div>
              <div className="text-sm text-gray-400">Goals Achieved</div>
              <div className="mt-auto pt-3">
                <div className="progress-bar"><div className="progress-fill" style={{ width: '60%', background: '#10b981' }} /></div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[2fr_1fr] mb-6">
            <div>
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-white text-lg">Weekly Progress</h2>
                  <div className="flex gap-2">
                    <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg">Week</button>
                    <button className="text-xs text-gray-400 hover:text-white px-3 py-1 rounded-lg transition">Month</button>
                  </div>
                </div>
                <div className="chart-placeholder rounded-xl">
                  <svg className="w-10 h-10 text-blue-600/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm text-blue-400/50 font-medium">Chart renders here (e.g. Chart.js / Recharts)</p>
                  <p className="text-xs text-gray-600">Workouts per day this week</p>
                </div>
                <div className="flex justify-between mt-3 px-2">
                  <span className="text-xs text-gray-600">Mon</span><span className="text-xs text-gray-600">Tue</span><span className="text-xs text-gray-600">Wed</span><span className="text-xs text-gray-600">Thu</span><span className="text-xs text-gray-600">Fri</span><span className="text-xs text-gray-600">Sat</span><span className="text-xs text-gray-600">Sun</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white text-lg">Recent Workouts</h2>
                <Link to="/workout-history" className="text-xs text-blue-400 hover:text-blue-300 transition">View all</Link>
              </div>
              <div className="space-y-3">
                {workouts.length > 0 ? (
                  workouts.slice(0, 3).map((w) => (
                    <WorkoutCard key={w.id} workout={w} />
                  ))
                ) : (
                  <div className="workout-row">
                    <div className="text-sm text-gray-400">No workouts yet. Start by logging your first workout.</div>
                  </div>
                )}
              </div>
              <Link to="/create-workout" className="mt-4 block text-center text-sm bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-2.5 rounded-xl transition font-medium">
                + Log New Workout
              </Link>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-lg">Active Goals</h2>
              <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition">Manage goals</a>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-300 font-medium">Complete 30 workouts this month</span><span className="text-white font-bold">28/30</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: '93%' }} /></div>
                <p className="text-xs text-gray-500 mt-1">93% — Almost there!</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-300 font-medium">20-day workout streak</span><span className="text-white font-bold">14/20</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: '70%', background: '#f97316' }} /></div>
                <p className="text-xs text-gray-500 mt-1">70% — Keep it up!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
