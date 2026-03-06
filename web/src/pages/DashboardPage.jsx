import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import workoutService from '../services/workoutService';
import goalService from '../services/goalService';

/* ── helpers ── */
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const today = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

const dayOfWeek = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const monthDate = () => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const d = new Date();
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const tagColor = (cat = '') => {
  const c = cat.toLowerCase();
  if (c.includes('upper')) return { bg: '#1e40af', text: '#3b82f6' };
  if (c.includes('lower')) return { bg: '#064e3b', text: '#34d399' };
  if (c.includes('core')) return { bg: '#4c1d95', text: '#c084fc' };
  if (c.includes('cardio')) return { bg: '#064e3b', text: '#34d399' };
  if (c.includes('full')) return { bg: '#92400e', text: '#fb923c' };
  return { bg: '#1e40af', text: '#3b82f6' };
};

const goalProgress = (g) =>
  g.targetValue > 0
    ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))
    : 0;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workouts, setWorkouts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({ total: 0, streak: 0, exercisesLogged: 0 });
  const [loadingW, setLoadingW] = useState(true);
  const [loadingG, setLoadingG] = useState(true);

  useEffect(() => {
    workoutService.getRecent(3)
      .then(data => {
        setWorkouts(data);
        setStats(prev => ({
          ...prev,
          total: data.totalCount ?? data.length,
          streak: data.streak ?? 0,
          exercisesLogged: data.exercisesLogged ?? 0,
        }));
      })
      .catch(console.error)
      .finally(() => setLoadingW(false));

    goalService.getAll()
      .then(data => setGoals(data.filter(g => g.status === 'IN_PROGRESS').slice(0, 3)))
      .catch(console.error)
      .finally(() => setLoadingG(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this workout?')) return;
    try {
      await workoutService.delete(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      alert('Failed to delete workout.');
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#050a15', backgroundImage: `linear-gradient(rgba(25, 34, 53, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(25, 34, 53, 0.3) 1px, transparent 1px)`, backgroundSize: '50px 50px', color: 'white', minHeight: '100vh', padding: '32px 40px' }}>
      
      {/* Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '56px', paddingBottom: '20px', borderBottom: '1px solid rgba(30, 41, 59, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #2b7fff 0%, #1e6fff 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', color: 'white', boxShadow: '0 8px 16px rgba(43, 127, 255, 0.3)' }}>
            💪
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ backgroundColor: 'rgba(43, 127, 255, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '10px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.3px' }} onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(43, 127, 255, 0.2)'; e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(43, 127, 255, 0.15)'; e.target.style.boxShadow = 'none'; }}>
              <span>📊</span> Dashboard
            </button>
            <button style={{ padding: '10px 18px', color: '#9ca3af', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.3px' }} onMouseEnter={(e) => { e.target.style.color = 'white'; e.target.style.backgroundColor = 'rgba(100, 116, 139, 0.1)'; }} onMouseLeave={(e) => { e.target.style.color = '#9ca3af'; e.target.style.backgroundColor = 'transparent'; }}>
              <span>📋</span> Workouts
            </button>
            <button style={{ padding: '10px 18px', color: '#9ca3af', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.3px' }} onMouseEnter={(e) => { e.target.style.color = 'white'; e.target.style.backgroundColor = 'rgba(100, 116, 139, 0.1)'; }} onMouseLeave={(e) => { e.target.style.color = '#9ca3af'; e.target.style.backgroundColor = 'transparent'; }}>
              <span>💪</span> Exercises
            </button>
            <button style={{ padding: '10px 18px', color: '#9ca3af', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.3px' }} onMouseEnter={(e) => { e.target.style.color = 'white'; e.target.style.backgroundColor = 'rgba(100, 116, 139, 0.1)'; }} onMouseLeave={(e) => { e.target.style.color = '#9ca3af'; e.target.style.backgroundColor = 'transparent'; }}>
              <span>🎯</span> Goals
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button style={{ background: 'linear-gradient(135deg, #2b7fff 0%, #1e6fff 100%)', padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', color: 'white', cursor: 'pointer', border: 'none', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.3px', boxShadow: '0 8px 20px rgba(43, 127, 255, 0.25)' }} onClick={() => navigate('/workouts/new')} onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(135deg, #1e6fff 0%, #1555d5 100%)'; e.target.style.boxShadow = '0 12px 28px rgba(43, 127, 255, 0.35)'; }} onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(135deg, #2b7fff 0%, #1e6fff 100%)'; e.target.style.boxShadow = '0 8px 20px rgba(43, 127, 255, 0.25)'; }}>
            <span style={{ marginRight: '6px' }}>+</span> Log Workout
          </button>
          <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: 'linear-gradient(135deg, #2b7fff 0%, #1e6fff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(43, 127, 255, 0.2)' }}>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div style={{ marginBottom: '56px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Good Morning, {user?.firstName} <span style={{ fontSize: '32px' }}>👋</span>
        </h1>
        <p style={{ color: '#9ca3af', marginTop: '12px', fontWeight: '500', fontSize: '16px' }}>{dayOfWeek()}, {monthDate()} — Keep pushing!</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
        <StatCard icon="💪" value={loadingW ? '—' : stats.total} label="Total Workouts" change={`↑ ${Math.min(stats.total || 0, 3)} this week`} color="#3b82f6" />
        <StatCard icon="🔥" value={loadingW ? '—' : stats.streak} label="Day Streak" change={stats.streak >= 7 ? '↑ Personal best!' : 'Keep it up!'} color="#34d399" />
        <StatCard icon="🎯" value={loadingG ? '—' : goals.length} label="Active Goals" change={`${goals.length} in progress`} color="#c084fc" />
        <StatCard icon="⏱️" value={loadingW ? '—' : stats.exercisesLogged} label="Exercises Logged" change={`↑ ${Math.min(stats.exercisesLogged || 0, 12)} this week`} color="#fb923c" />
      </div>

      {/* Recent Workouts Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)' }} /> Recent Workouts
          </h2>
          <button style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '700', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.3px' }} onMouseEnter={(e) => e.target.style.color = '#3b82f6'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'} onClick={() => navigate('/workouts')}>
            View All →
          </button>
        </div>

        {/* Workouts Grid */}
        {loadingW ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: '280px', backgroundColor: '#0d1526', border: '1px solid #1e293b', borderRadius: '16px', animation: 'pulse 2s infinite', opacity: 0.5 }} />)}
          </div>
        ) : workouts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 40px', backgroundColor: '#0d1526', borderRadius: '16px', border: '1px solid rgba(30, 41, 59, 0.8)', marginBottom: '56px', boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.3)' }}>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>💪</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>No workouts yet</div>
            <p style={{ color: '#9ca3af', marginBottom: '28px', fontSize: '16px' }}>Log your first workout to start tracking your progress.</p>
            <button style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '12px 32px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', border: 'none', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.3px', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)', transition: 'all 0.2s' }} onClick={() => navigate('/workouts/new')} onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'; }} onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'; }}>
              + Log First Workout
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '56px' }}>
            {workouts.map(w => <WorkoutCard key={w.id} workout={w} onClick={() => navigate(`/workouts/${w.id}`)} onEdit={(e) => { e.stopPropagation(); navigate(`/workouts/${w.id}/edit`); }} onDelete={(e) => handleDelete(w.id, e)} />)}
          </div>
        )}
      </div>

      {/* Active Goals Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#34d399', borderRadius: '50%', boxShadow: '0 0 12px rgba(52, 211, 153, 0.5)' }} /> Active Goals
          </h2>
          <button style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '700', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.3px' }} onMouseEnter={(e) => e.target.style.color = '#34d399'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'} onClick={() => navigate('/goals')}>
            Manage Goals →
          </button>
        </div>

        {/* Goals Grid */}
        {loadingG ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: '240px', backgroundColor: '#0d1526', border: '1px solid #1e293b', borderRadius: '16px', animation: 'pulse 2s infinite', opacity: 0.5 }} />)}
          </div>
        ) : goals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 40px', backgroundColor: '#0d1526', borderRadius: '16px', border: '1px solid rgba(30, 41, 59, 0.8)', boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.3)' }}>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>🎯</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>No active goals</div>
            <p style={{ color: '#9ca3af', marginBottom: '28px', fontSize: '16px' }}>Set a fitness goal to stay motivated and track progress.</p>
            <button style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', color: 'white', padding: '12px 32px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', border: 'none', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.3px', boxShadow: '0 8px 20px rgba(52, 211, 153, 0.25)', transition: 'all 0.2s' }} onClick={() => navigate('/goals')} onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; }} onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'; }}>
              + Add Goal
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {goals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, change, color }) {
  return (
    <div style={{
      backgroundColor: '#0d1526',
      border: '1px solid rgba(30, 41, 59, 0.8)',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = `rgba(59, 130, 246, 0.2)`;
      e.currentTarget.style.boxShadow = `0 12px 30px -5px ${color}40`;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.8)';
      e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(0, 0, 0, 0.3)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{ position: 'absolute', top: '0', right: '0', width: '80px', height: '80px', background: `${color}15`, borderRadius: '50%', transform: 'translate(20px, -20px)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '32px', display: 'block', marginBottom: '16px' }}>{icon}</span>
        <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', background: `linear-gradient(135deg, ${color}, ${color}dd)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{value}</h3>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>{label}</p>
        <p style={{ color: color, fontSize: '13px', fontWeight: '700' }}>{change}</p>
      </div>
    </div>
  );
}

function WorkoutCard({ workout, onClick, onEdit, onDelete }) {
  const categories = [...new Set(
    (workout.exercises ?? []).map(e => e.category).filter(Boolean)
  )].slice(0, 2);
  const totalSets = (workout.exercises ?? []).reduce((sum, e) => sum + (e.sets || 0), 0);

  return (
    <div style={{ 
      backgroundColor: '#0d1526', 
      border: '1px solid rgba(30, 41, 59, 0.8)', 
      borderRadius: '16px', 
      padding: '24px', 
      cursor: 'pointer', 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }} 
    onClick={onClick} 
    onMouseEnter={(e) => { 
      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
      e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(59, 130, 246, 0.2)';
      e.currentTarget.style.transform = 'translateY(-4px)';
    }} 
    onMouseLeave={(e) => { 
      e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.8)';
      e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(0, 0, 0, 0.3)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#64b5f6', textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          📅 {formatDate(workout.workoutDate)}
        </div>
        <div style={{ fontSize: '20px' }}>💪</div>
      </div>
      <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#e2e8f0' }}>
        {workout.notes || `Workout — ${formatDate(workout.workoutDate)}`}
      </h4>
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const colors = tagColor(cat);
            return <span key={cat} style={{ backgroundColor: colors.bg, color: colors.text, fontSize: '11px', padding: '5px 12px', borderRadius: '20px', fontWeight: '600', border: `1px solid ${colors.text}40` }}>{cat}</span>;
          })}
        </div>
      )}
      <div style={{ display: 'flex', gap: '28px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(45, 55, 72, 0.3)' }}>
        <div>
          <span style={{ display: 'block', fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>{workout.exercises?.length ?? 0}</span>
          <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.3px' }}>Exercises</span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '20px', fontWeight: '700', color: '#34d399' }}>{totalSets}</span>
          <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.3px' }}>Total Sets</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button style={{ 
          flex: 1, 
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '10px', 
          borderRadius: '10px', 
          fontSize: '13px', 
          fontWeight: '700', 
          color: '#64b5f6', 
          cursor: 'pointer', 
          transition: 'all 0.2s',
          textTransform: 'uppercase',
          letterSpacing: '0.3px'
        }} 
        onClick={onEdit} 
        onMouseEnter={(e) => { 
          e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.2)';
          e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
        }} 
        onMouseLeave={(e) => { 
          e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
          e.target.style.boxShadow = 'none';
        }}>
          <span style={{ marginRight: '6px' }}>📝</span> Edit
        </button>
        <button style={{ 
          flex: 1, 
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          padding: '10px', 
          borderRadius: '10px', 
          fontSize: '13px', 
          fontWeight: '700', 
          color: '#fc8181', 
          cursor: 'pointer', 
          transition: 'all 0.2s',
          textTransform: 'uppercase',
          letterSpacing: '0.3px'
        }} 
        onClick={onDelete} 
        onMouseEnter={(e) => { 
          e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
          e.target.style.boxShadow = '0 0 0 2px rgba(220, 38, 38, 0.2)';
        }} 
        onMouseLeave={(e) => { 
          e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
          e.target.style.boxShadow = 'none';
        }}>
          <span style={{ marginRight: '6px' }}>🗑️</span> Delete
        </button>
      </div>
    </div>
  );
}

function GoalCard({ goal }) {
  const pct = goalProgress(goal);
  const badgeColors = {
    green: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(52, 211, 153, 0.3)' },
    blue: { bg: 'rgba(37, 99, 235, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
    orange: { bg: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' }
  };

  let badgeText = 'Just Started';
  let badgeVariant = badgeColors.orange;

  if (goal.status === 'COMPLETED') {
    badgeText = '✅ Done';
    badgeVariant = badgeColors.green;
  } else if (pct >= 80) {
    badgeText = '🔥 Near Done!';
    badgeVariant = badgeColors.green;
  } else if (pct >= 40) {
    badgeText = 'In Progress';
    badgeVariant = badgeColors.blue;
  }

  const barColor = goal.status === 'COMPLETED' ? 'linear-gradient(90deg, #34d399 0%, #6ee7b7 100%)' :
                  pct >= 80 ? 'linear-gradient(90deg, #34d399 0%, #6ee7b7 100%)' :
                  pct >= 40 ? 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)' :
                            'linear-gradient(90deg, #fb923c 0%, #fbbf24 100%)';

  return (
    <div style={{ 
      backgroundColor: '#0d1526', 
      border: '1px solid rgba(30, 41, 59, 0.8)', 
      borderRadius: '16px', 
      padding: '20px',
      boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
      e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(59, 130, 246, 0.2)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.8)';
      e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(0, 0, 0, 0.3)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>🎯 {goal.goalType}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', fontWeight: '500' }}>Target: {formatDate(goal.endDate)}</div>
        </div>
        <span style={{ backgroundColor: badgeVariant.bg, color: badgeVariant.color, padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', border: `1px solid ${badgeVariant.border}`, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {badgeText}
        </span>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginBottom: '8px', fontWeight: '600' }}>
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', height: '8px', overflow: 'hidden', border: '1px solid rgba(45, 55, 72, 0.3)' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: barColor, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '10px', boxShadow: `0 0 12px ${barColor.split(' ')[2].slice(0, -1)}` }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>
        <span>{goal.currentValue} current</span>
        <span>{goal.targetValue} target</span>
      </div>
    </div>
  );
}