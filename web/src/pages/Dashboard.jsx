import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/authService';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

const WEEKLY_WORKOUT_GOAL = 4;
const WEEK_DAYS_MON_TO_SUN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeWorkouts = (payload) =>
  normalizeList(payload).map((workout) => ({
    id: workout?.id,
    title: workout?.title ?? '',
    workoutDate: workout?.workoutDate ?? workout?.workout_date ?? null,
    createdAt: workout?.createdAt ?? workout?.created_at ?? null,
    logs: Array.isArray(workout?.logs)
      ? workout.logs.map((log) => ({
          ...log,
          exerciseName: log?.exerciseName ?? log?.exercise_name ?? '',
          muscleGroup: log?.muscleGroup ?? log?.muscle_group ?? '',
        }))
      : [],
  }));

const normalizeGoals = (payload) =>
  normalizeList(payload).map((goal) => ({
    id: goal?.id,
    goalText: goal?.goalText ?? goal?.goal_text ?? 'Untitled goal',
    goalType: goal?.goalType ?? goal?.goal_type ?? '',
    targetValue: Number(goal?.targetValue ?? goal?.target_value ?? 0),
    currentValue: Number(goal?.currentValue ?? goal?.current_value ?? 0),
    achieved: Boolean(goal?.achieved),
    createdAt: goal?.createdAt ?? goal?.created_at ?? null,
  }));

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfToday = (date = new Date()) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const startOfWeek = (date = new Date()) => {
  const copy = startOfToday(date);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
};

const endOfWeek = (date = new Date()) => {
  const copy = startOfWeek(date);
  copy.setDate(copy.getDate() + 6);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const startOfWeekMonday = (date = new Date()) => {
  const copy = startOfToday(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() + (day === 0 ? -6 : 1 - day));
  return copy;
};

const endOfWeekMonday = (date = new Date()) => {
  const copy = startOfWeekMonday(date);
  copy.setDate(copy.getDate() + 6);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const formatDate = (dateString) => {
  const date = toDate(dateString);
  if (!date) return 'Unknown date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getRelativeDate = (dateString) => {
  const date = toDate(dateString);
  if (!date) return 'Unknown';
  const today = startOfToday();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date >= today) return 'Today';
  if (date >= yesterday && date < today) return 'Yesterday';
  return formatDate(dateString);
};

const getWorkoutDateKey = (workout) => {
  const date = toDate(workout?.workoutDate || workout?.createdAt);
  return date ? date.toISOString().slice(0, 10) : null;
};

const getWorkoutDate = (workout) => toDate(workout?.workoutDate || workout?.createdAt);

const getWorkoutsThisWeek = (workouts) => {
  const weekStart = startOfWeek();
  const weekEnd = endOfWeek();
  return workouts.filter((w) => {
    const d = toDate(w?.workoutDate || w?.createdAt);
    return !!d && d >= weekStart && d <= weekEnd;
  });
};

const getWeeklyChartData = (workouts) => {
  const counts = WEEK_DAYS_MON_TO_SUN.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});
  const weekStart = startOfWeekMonday();
  const weekEnd = endOfWeekMonday();
  workouts.forEach((w) => {
    const date = getWorkoutDate(w);
    if (!date || date < weekStart || date > weekEnd) return;
    const dayOfWeek = date.getDay();
    let label;
    if (dayOfWeek === 0) label = 'Sun';
    else if (dayOfWeek === 1) label = 'Mon';
    else if (dayOfWeek === 2) label = 'Tue';
    else if (dayOfWeek === 3) label = 'Wed';
    else if (dayOfWeek === 4) label = 'Thu';
    else if (dayOfWeek === 5) label = 'Fri';
    else if (dayOfWeek === 6) label = 'Sat';
    if (label) counts[label] += 1;
  });
  const chartData = WEEK_DAYS_MON_TO_SUN.map((day) => ({ day, count: counts[day] }));
  console.log('Chart Data:', chartData);
  return chartData;
};

const getMonthChartData = (workouts) => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);
  const cursor = new Date(startOfWeek(monthStart));
  const chartData = [];
  let weekIndex = 1;
  while (cursor <= monthEnd) {
    const wStart = new Date(cursor);
    const wEnd = new Date(cursor);
    wEnd.setDate(wEnd.getDate() + 6);
    wEnd.setHours(23, 59, 59, 999);
    const count = workouts.filter((w) => {
      const d = getWorkoutDate(w);
      return !!d && d >= wStart && d <= wEnd && d >= monthStart && d <= monthEnd;
    }).length;
    chartData.push({ day: `W${weekIndex}`, count });
    cursor.setDate(cursor.getDate() + 7);
    weekIndex += 1;
  }
  return chartData;
};

const renderProgressBars = (chartData = []) => {
  const safeData = Array.isArray(chartData) ? chartData : [];
  if (safeData.length === 0) {
    return (
      <div className="db-empty-chart">No workouts this week. Add your first workout!</div>
    );
  }
  const maxCount = Math.max(1, ...safeData.map((p) => Number(p?.count) || 0));
  const maxBarHeightPx = 200;
  return (
    <div className="db-chart-container">
      <div className="db-chart-bars">
        {safeData.map((point) => {
          const value = Number(point?.count) || 0;
          const heightPx = value === 0 ? 10 : Math.max(32, Math.round((value / maxCount) * maxBarHeightPx));
          return (
            <div key={point.day} className="db-chart-col">
              <span className="db-chart-count">{value > 0 ? value : ''}</span>
              <div
                className={`db-bar ${value > 0 ? 'db-bar--active' : 'db-bar--empty'}`}
                style={{ height: `${heightPx}px` }}
              />
              <span className="db-chart-label">{point.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const calculateStreak = (workouts) => {
  const dates = new Set(workouts.map(getWorkoutDateKey).filter(Boolean));
  if (!dates.size) return 0;
  let streak = 0;
  const cursor = startOfToday();
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const getCategoryFromLogs = (logs = []) => {
  if (!Array.isArray(logs) || logs.length === 0) return 'General';
  const counts = logs.reduce((acc, log) => {
    const v = String(log?.muscleGroup || '').trim().toLowerCase();
    let cat = 'General';
    if (v.includes('upper')) cat = 'Upper Body';
    else if (v.includes('lower') || v.includes('leg')) cat = 'Lower Body';
    else if (v.includes('core') || v.includes('abs')) cat = 'Core';
    else if (v.includes('cardio') || v.includes('run') || v.includes('bike')) cat = 'Cardio';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([c]) => c)[0] || 'General';
};

const getGoalStatus = (current, target) => {
  const pct = Number(target) > 0 ? (Number(current) / Number(target)) * 100 : 0;
  if (pct >= 100) return { text: '✓ Done',       pct: 100, color: '#10b981', badge: 'goal-badge--green' };
  if (pct >= 90)  return { text: 'Almost There!', pct,      color: '#10b981', badge: 'goal-badge--green' };
  if (pct >= 50)  return { text: 'In Progress',   pct,      color: '#3b82f6', badge: 'goal-badge--blue'  };
  return              { text: 'Just Started',  pct,      color: '#64748b', badge: 'goal-badge--slate' };
};

const getWorkoutTitle = (workout) => {
  if (workout?.title && String(workout.title).trim()) return workout.title;
  const logs = Array.isArray(workout?.logs) ? workout.logs : [];
  if (logs.length === 1) return logs[0]?.exerciseName || 'Workout Session';
  if (logs.length > 1) return `${logs[0]?.exerciseName || 'Workout'} +${logs.length - 1} more`;
  return `Workout ${formatDate(workout?.workoutDate || workout?.createdAt)}`;
};

const CAT_BADGE = [
  'cat-badge--blue',
  'cat-badge--emerald',
  'cat-badge--violet',
  'cat-badge--amber',
  'cat-badge--rose',
];

export default function Dashboard() {
  const [user, setUser]                     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [chartView, setChartView]           = useState('week');
  const [workouts, setWorkouts]             = useState(null);
  const [goals, setGoals]                   = useState([]);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [userRes, workoutsRes, goalsRes] = await Promise.all([
        authService.getCurrentUser(),
        api.get('/api/v1/workouts'),
        api.get('/api/v1/goals'),
      ]);
      setUser(userRes.data);
      setWorkouts(normalizeWorkouts(workoutsRes.data));
      setGoals(normalizeGoals(goalsRes.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      if (err.response?.status === 401 || err.response?.status === 403) {
        authService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="db-loading-screen">
        <div className="db-spinner" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  if (!user)     return <div className="db-loading-screen">User not found</div>;
  if (!workouts) return <div className="db-loading-screen">Loading…</div>;

  const totalWorkouts    = workouts.length;
  const workoutsThisWeek = getWorkoutsThisWeek(workouts);
  const activeDayStreak  = calculateStreak(workouts);
  const weeklyProgress   = Math.min(100, Math.round((workoutsThisWeek.length / WEEKLY_WORKOUT_GOAL) * 100));
  const achievedGoals    = goals.filter((g) => Number(g.currentValue) >= Number(g.targetValue)).length;
  const activeGoals      = goals.length - achievedGoals;
  const chartData        = chartView === 'week' ? getWeeklyChartData(workouts) : getMonthChartData(workouts);
  const recentWorkouts   = workouts.slice(0, 4);

  const renderChart = () => {
    try { return chartData ? renderProgressBars(chartData) : <div className="db-empty-chart">Chart unavailable</div>; }
    catch { return <div className="db-empty-chart">Chart unavailable</div>; }
  };

  const hour         = new Date().getHours();
  const greeting     = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const emoji        = hour < 12 ? '👋' : '💪';
  const fullName     = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Athlete';
  const firstName    = fullName.split(' ')[0];
  const displayDate  = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="db-root">

      <Sidebar user={user} active="dashboard" />

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="db-main">

        {/* Top bar */}
        <div className="db-topbar">
          <div>
            <h1 className="db-topbar-greeting">{greeting}, {firstName}! {emoji}</h1>
            <p className="db-topbar-date">{displayDate}</p>
          </div>
          <Link to="/create-workout" className="dashboard-primary-button">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            New Workout
          </Link>
        </div>

        {/* Page body */}
        <div className="db-body">

          {error && <div className="db-error">{error}</div>}

          {/* ── Stat cards ── */}
          <div className="db-stat-grid">

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon stat-icon--blue">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="stat-badge stat-badge--green">+{workoutsThisWeek.length} this week</span>
              </div>
              <div className="stat-value">{totalWorkouts}</div>
              <div className="stat-label">Workouts Completed</div>
              <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                <div className="progress-fill" style={{ width: `${weeklyProgress}%` }} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon stat-icon--orange">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
                <span className="stat-badge stat-badge--orange">🔥 Streak!</span>
              </div>
              <div className="stat-value">{activeDayStreak}</div>
              <div className="stat-label">Active Days Streak</div>
              <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                <div className="progress-fill" style={{ width: `${Math.min(100, activeDayStreak * 10)}%`, background: '#f97316' }} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon stat-icon--emerald">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <span className="stat-badge stat-badge--emerald">{activeGoals} active</span>
              </div>
              <div className="stat-value">{achievedGoals}/{goals.length}</div>
              <div className="stat-label">Goals Achieved</div>
              <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                <div className="progress-fill" style={{ width: `${goals.length ? Math.round((achievedGoals / goals.length) * 100) : 0}%`, background: '#10b981' }} />
              </div>
            </div>
          </div>

          {/* ── Goals + Workouts ── */}
          <div className="db-mid-grid">

            {/* Active Goals */}
            <div className="glass db-card">
              <div className="db-card-header">
                <div>
                  <h2 className="db-card-title">Active Goals</h2>
                  <p className="db-card-sub">Monitor your current progress</p>
                </div>
                <a href="/goals" className="db-link">Manage →</a>
              </div>

              {goals.length > 0 ? (
                <div className="db-goal-list">
                  {goals.slice(0, 4).map((goal) => {
                    const status  = getGoalStatus(goal.currentValue, goal.targetValue);
                    const current = Number(goal.currentValue) || 0;
                    const target  = Number(goal.targetValue)  || 0;
                    return (
                      <div key={goal.id} className="db-goal-item">
                        <div className="db-goal-row">
                          <span className="db-goal-text">{goal.goalText}</span>
                          <div className="db-goal-right">
                            <span className="db-goal-count">{current.toFixed(0)}/{target.toFixed(0)}</span>
                            <span className={`db-goal-badge ${status.badge}`}>{status.text}</span>
                          </div>
                        </div>
                        <div className="progress-bar" style={{ height: '5px', marginTop: '8px' }}>
                          <div className="progress-fill" style={{ width: `${Math.min(100, status.pct)}%`, background: status.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="db-empty-card">
                  <p>No goals set yet.</p>
                  <a href="/goals" className="db-link" style={{ marginTop: '4px', display: 'inline-block' }}>+ Set a goal</a>
                </div>
              )}
            </div>

            {/* Recent Workouts */}
            <div className="glass db-card">
              <div className="db-card-header">
                <div>
                  <h2 className="db-card-title">Recent Workouts</h2>
                  <p className="db-card-sub">Latest sessions from your training log</p>
                </div>
                <Link to="/workout-history" className="db-link">View All →</Link>
              </div>

              <div className="db-workout-list">
                {recentWorkouts.length > 0 ? (
                  recentWorkouts.map((w, i) => (
                    <div key={w.id} className="db-workout-item">
                      <div className="db-workout-meta">
                        <span className="db-workout-date">{getRelativeDate(w.workoutDate || w.createdAt)}</span>
                        <span className="db-dot">·</span>
                        <span className={`db-cat-badge ${CAT_BADGE[i % CAT_BADGE.length]}`}>
                          {getCategoryFromLogs(w.logs)}
                        </span>
                      </div>
                      <div className="db-workout-row">
                        <div className="db-workout-info">
                          <div className="db-workout-title">{getWorkoutTitle(w)}</div>
                          <div className="db-workout-exercises">
                            {(w.logs || []).slice(0, 4).map((l) => l.exerciseName).filter(Boolean).join(' · ') || 'No exercises recorded'}
                          </div>
                        </div>
                        <div className="db-workout-count">
                          <span className="db-workout-num">{(w.logs || []).length}</span>
                          <span className="db-workout-unit">exercises</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="db-empty-card">No workouts yet. Start with your first session.</div>
                )}
              </div>

              <div className="db-workout-footer">
                <Link to="/create-workout" className="db-link">+ Log New Workout</Link>
              </div>
            </div>
          </div>

          {/* ── Weekly Progress ── */}
          <div className="glass db-card">
            <div className="db-card-header">
              <div>
                <h2 className="db-card-title">Weekly Progress</h2>
                <p className="db-card-sub">Track your activity and weekly momentum</p>
              </div>
              <div className="db-chart-toggle">
                <button
                  type="button"
                  onClick={() => setChartView('week')}
                  className={chartView === 'week' ? 'db-toggle-btn db-toggle-btn--active' : 'db-toggle-btn'}
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('month')}
                  className={chartView === 'month' ? 'db-toggle-btn db-toggle-btn--active' : 'db-toggle-btn'}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="db-chart-wrap">{renderChart()}</div>
          </div>

        </div>
      </main>
    </div>
  );
}
