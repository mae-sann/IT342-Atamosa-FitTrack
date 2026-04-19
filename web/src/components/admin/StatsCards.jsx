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

const formatNumber = (value) => Number(value || 0).toLocaleString();

const statCards = (stats) => ([
  {
    key: 'users',
    icon: <UserIcon />,
    iconClass: 'bg-blue-600/20',
    value: formatNumber(stats.totalUsers),
    title: 'Total Users',
    subtitle: `+${formatNumber(stats.newUsersThisWeek)} this week`,
    subtitleClass: 'text-emerald-400',
  },
  {
    key: 'workouts',
    icon: <WorkoutIcon />,
    iconClass: 'bg-emerald-600/20',
    value: formatNumber(stats.totalWorkouts),
    title: 'Total Workouts',
    subtitle: `+${formatNumber(stats.workoutsToday)} today`,
    subtitleClass: 'text-emerald-400',
  },
  {
    key: 'exercises',
    icon: <ExerciseIcon />,
    iconClass: 'bg-purple-600/20',
    value: formatNumber(stats.totalExercises),
    title: 'Total Exercises',
    subtitle: `Across ${formatNumber(stats.categoryCount)} categories`,
    subtitleClass: 'text-gray-500',
  },
  {
    key: 'active',
    icon: <ActiveIcon />,
    iconClass: 'bg-orange-600/20',
    value: formatNumber(stats.activeToday),
    title: 'Active Today',
    subtitle: `${formatNumber(stats.activePercentage)}% of users`,
    subtitleClass: 'text-emerald-400',
  },
]);

export default function StatsCards({ stats }) {
  return (
    <div className="admin-stats-grid mb-20">
      {statCards(stats).map((card) => (
        <div key={card.key} className="admin-stat-card">
          <div className={`admin-stat-icon ${card.iconClass}`}>
            {card.icon}
          </div>
          <div className="admin-stat-value">{card.value}</div>
          <div className="admin-stat-title">{card.title}</div>
          <div className={`admin-stat-subtitle ${card.subtitleClass}`}>{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
