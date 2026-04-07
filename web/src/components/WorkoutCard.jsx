export default function WorkoutCard({ workout }) {
  return (
    <div className="workout-row">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-white">
          {workout?.title || 'Workout Session'}
        </span>
        <span className="text-xs text-gray-500">
          {workout?.workoutDate
            ? new Date(workout.workoutDate).toLocaleDateString()
            : '-'}
        </span>
      </div>
      <div className="text-xs text-gray-400">
        {workout?.totalExercises || 0} exercise
        {(workout?.totalExercises || 0) === 1 ? '' : 's'}
      </div>
    </div>
  );
}
