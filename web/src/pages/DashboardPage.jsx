import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Tag, Badge } from '../components/ui/Badge';
import workoutService from '../services/workoutService';
import goalService from '../services/goalService';
import styles from './DashboardPage.module.css';

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

const tagVariant = (cat = '') => {
  const c = cat.toLowerCase();
  if (c.includes('upper'))  return 'blue';
  if (c.includes('lower'))  return 'green';
  if (c.includes('core'))   return 'violet';
  if (c.includes('cardio')) return 'green';
  if (c.includes('full'))   return 'orange';
  return 'blue';
};

const goalProgress = (g) =>
  g.targetValue > 0
    ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))
    : 0;

const goalBadge = (pct, status) => {
  if (status === 'COMPLETED') return { label: '✅ Done',       variant: 'green'  };
  if (pct >= 80)              return { label: '🔥 Near Done!', variant: 'green'  };
  if (pct >= 40)              return { label: 'In Progress',   variant: 'blue'   };
  return                             { label: 'Just Started',  variant: 'orange' };
};

/* ═══════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate        = useNavigate();
  const { user }        = useAuth();

  const [workouts, setWorkouts]   = useState([]);
  const [goals,    setGoals]      = useState([]);
  const [stats,    setStats]      = useState({ total: 0, streak: 0, exercisesLogged: 0 });
  const [loadingW, setLoadingW]   = useState(true);
  const [loadingG, setLoadingG]   = useState(true);

  /* ── fetch data ── */
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

  /* ── delete workout ── */
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

  /* ── render ── */
  return (
    <div>
      {/* ── Page Header ── */}
      <div className={`${styles.titleRow} ${styles.fadeUp}`}>
        <div>
          <h1 className={styles.pageTitle}>
            {greeting()}, {user?.firstName} 👋
          </h1>
          <p className={styles.pageSub}>{today()} — Keep pushing!</p>
        </div>
        <Button leftIcon="+" onClick={() => navigate('/workouts/new')}>
          Log Workout
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      <div className={`${styles.statsRow} ${styles.fadeUp} ${styles.delay1}`}>
        <StatCard
          icon="💪"
          value={loadingW ? '—' : stats.total}
          label="Total Workouts"
          change={stats.total > 0 ? `↑ ${Math.min(stats.total, 3)} this week` : 'Start logging!'}
          accent="blue"
        />
        <StatCard
          icon="🔥"
          value={loadingW ? '—' : stats.streak}
          label="Day Streak"
          change={stats.streak >= 7 ? '↑ Personal best!' : stats.streak > 0 ? 'Keep it up!' : 'Log a workout!'}
          accent="green"
        />
        <StatCard
          icon="🎯"
          value={loadingG ? '—' : goals.length}
          label="Active Goals"
          change={goals.length > 0 ? `${goals.length} in progress` : 'Set a goal!'}
          accent="violet"
        />
        <StatCard
          icon="⏱️"
          value={loadingW ? '—' : stats.exercisesLogged}
          label="Exercises Logged"
          change={stats.exercisesLogged > 0 ? `↑ ${Math.min(stats.exercisesLogged, 12)} this week` : 'Get started!'}
          accent="orange"
        />
      </div>

      {/* ── Recent Workouts ── */}
      <div className={`${styles.sectionHeader} ${styles.fadeUp} ${styles.delay2}`}>
        <div className={styles.sectionTitle}>
          <span className={styles.dot} />
          Recent Workouts
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/workouts')}>
          View All →
        </Button>
      </div>

      {loadingW ? (
        <div className={styles.skeletonGrid}>
          {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : workouts.length === 0 ? (
        <EmptyWorkouts onAdd={() => navigate('/workouts/new')} />
      ) : (
        <div className={`${styles.workoutGrid} ${styles.fadeUp} ${styles.delay2}`}>
          {workouts.map(w => (
            <WorkoutCard
              key={w.id}
              workout={w}
              onClick={() => navigate(`/workouts/${w.id}`)}
              onEdit={(e) => { e.stopPropagation(); navigate(`/workouts/${w.id}/edit`); }}
              onDelete={(e) => handleDelete(w.id, e)}
            />
          ))}
        </div>
      )}

      {/* ── Divider ── */}
      <div className={styles.divider} />

      {/* ── Active Goals ── */}
      <div className={`${styles.sectionHeader} ${styles.fadeUp} ${styles.delay3}`}>
        <div className={styles.sectionTitle}>
          <span className={styles.dot} />
          Active Goals
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/goals')}>
          Manage Goals →
        </Button>
      </div>

      {loadingG ? (
        <div className={styles.skeletonGrid}>
          {[1,2,3].map(i => <div key={i} className={`${styles.skeleton} ${styles.skeletonTall}`} />)}
        </div>
      ) : goals.length === 0 ? (
        <EmptyGoals onAdd={() => navigate('/goals')} />
      ) : (
        <div className={`${styles.goalsGrid} ${styles.fadeUp} ${styles.delay3}`}>
          {goals.map(g => <GoalCard key={g.id} goal={g} />)}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WORKOUT CARD
═══════════════════════════════════════════════════════ */
function WorkoutCard({ workout, onClick, onEdit, onDelete }) {
  const categories = [...new Set(
    (workout.exercises ?? []).map(e => e.category).filter(Boolean)
  )].slice(0, 2);

  const totalSets = (workout.exercises ?? []).reduce((sum, e) => sum + (e.sets || 0), 0);

  return (
    <div className={styles.workoutCard} onClick={onClick}>
      <div className={styles.workoutDateBadge}>
        📅 {formatDate(workout.workoutDate)}
      </div>
      <div className={styles.workoutName}>
        {workout.notes || `Workout — ${formatDate(workout.workoutDate)}`}
      </div>
      <div className={styles.workoutTags}>
        {categories.map(cat => (
          <Tag key={cat} variant={tagVariant(cat)}>{cat}</Tag>
        ))}
        {categories.length === 0 && <Tag variant="muted">General</Tag>}
      </div>
      <div className={styles.workoutMeta}>
        <div className={styles.workoutMetaItem}>
          <span className={styles.metaValue}>{workout.exercises?.length ?? 0}</span>
          <span className={styles.metaLabel}>Exercises</span>
        </div>
        <div className={styles.workoutMetaItem}>
          <span className={styles.metaValue}>{totalSets}</span>
          <span className={styles.metaLabel}>Total Sets</span>
        </div>
      </div>
      <div className={styles.workoutActions}>
        <Button variant="secondary" size="sm" onClick={onEdit}>✏️ Edit</Button>
        <Button variant="danger"    size="sm" onClick={onDelete}>🗑 Delete</Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   GOAL CARD
═══════════════════════════════════════════════════════ */
function GoalCard({ goal }) {
  const pct   = goalProgress(goal);
  const badge = goalBadge(pct, goal.status);

  const barColor =
    goal.status === 'COMPLETED' ? 'linear-gradient(90deg,#34D399,#6EE7B7)' :
    pct >= 80  ? 'linear-gradient(90deg,#34D399,#6EE7B7)' :
    pct >= 40  ? 'linear-gradient(90deg,#1E6FFF,#4D8FFF)' :
                 'linear-gradient(90deg,#FB923C,#FBBF24)';

  return (
    <div className={styles.goalCard}>
      <div className={styles.goalCardTop}>
        <div>
          <div className={styles.goalType}>{goal.goalType}</div>
          <div className={styles.goalDates}>Target: {formatDate(goal.endDate)}</div>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <div className={styles.progressWrap}>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <div className={styles.progressLabel}>
          <span>{goal.currentValue} current</span>
          <span>{goal.targetValue} target</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EMPTY STATES
═══════════════════════════════════════════════════════ */
function EmptyWorkouts({ onAdd }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>🏋️</div>
      <div className={styles.emptyTitle}>No workouts yet</div>
      <p className={styles.emptySub}>Log your first workout to start tracking your progress.</p>
      <Button onClick={onAdd}>+ Log First Workout</Button>
    </div>
  );
}

function EmptyGoals({ onAdd }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>🎯</div>
      <div className={styles.emptyTitle}>No active goals</div>
      <p className={styles.emptySub}>Set a fitness goal to stay motivated and track progress.</p>
      <Button onClick={onAdd}>+ Add Goal</Button>
    </div>
  );
}