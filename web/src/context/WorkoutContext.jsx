import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import workoutAPI from '../api/workoutAPI';

const WorkoutContext = createContext(null);

export function WorkoutProvider({ children }) {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    const data = await workoutAPI.getAll();
    setWorkouts(data);
    setIsLoading(false);
  }, []);

  const addWorkout = useCallback(async (workoutData) => {
    const saved = await workoutAPI.create(workoutData);
    setWorkouts((prev) => [saved, ...prev]);
    return saved;
  }, []);

  const deleteWorkout = useCallback(async (id) => {
    await workoutAPI.delete(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  useEffect(() => {
    fetchWorkouts().catch(() => {
      setIsLoading(false);
    });
  }, [fetchWorkouts]);

  return (
    <WorkoutContext.Provider
      value={{ workouts, isLoading, fetchWorkouts, addWorkout, deleteWorkout }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

const useWorkouts = () => useContext(WorkoutContext);

export { useWorkouts };
