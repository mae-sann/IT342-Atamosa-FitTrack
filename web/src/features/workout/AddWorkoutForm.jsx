import { useState } from 'react';
import { useWorkouts } from '../../shared/context/WorkoutContext';

export default function AddWorkoutForm() {
  const { addWorkout } = useWorkouts();
  const [form, setForm] = useState({ date: '', notes: '', exercises: [] });

  const handleSubmit = async () => {
    await addWorkout(form);
    setForm({ date: '', notes: '', exercises: [] });
  };

  return (
    <div className="space-y-3">
      <input
        type="date"
        value={form.date}
        onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
      />
      <input
        type="text"
        placeholder="Notes"
        value={form.notes}
        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
      />
      <button type="button" onClick={handleSubmit}>
        Save Workout
      </button>
    </div>
  );
}
