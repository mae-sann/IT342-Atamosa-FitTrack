import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add JWT token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  register: (name, email, password, role) =>
    apiClient.post('/api/auth/register', { name, email, password, role }),

  login: (email, password) =>
    apiClient.post('/api/auth/login', { email, password }),

  loginWithGoogle: (idToken) =>
    apiClient.post('/api/auth/oauth/google', { idToken }),

  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  getCurrentUser: () =>
    apiClient.get('/api/users/me'),

  getWorkouts: () =>
    apiClient.get('/api/workouts'),

  deleteUser: (userId) =>
    apiClient.delete(`/api/users/${userId}`),

  getAllUsers: () =>
    apiClient.get('/api/users'),

  getExercises: () =>
    apiClient.get('/api/v1/exercises'),

  createExercise: (payload) =>
    apiClient.post('/api/v1/exercises', payload),

  updateExercise: (exerciseId, payload) =>
    apiClient.put(`/api/v1/exercises/${exerciseId}`, payload),

  deleteExercise: (exerciseId) =>
    apiClient.delete(`/api/v1/exercises/${exerciseId}`),

  addExerciseSelection: (exercise) => {
    const selectedExercises = JSON.parse(localStorage.getItem('selected_workout_exercises') || '[]');
    const alreadySelected = selectedExercises.some((selected) => selected.id === exercise.id);

    if (!alreadySelected) {
      selectedExercises.push(exercise);
      localStorage.setItem('selected_workout_exercises', JSON.stringify(selectedExercises));
    }

    return selectedExercises;
  },

  getExerciseSelections: () =>
    JSON.parse(localStorage.getItem('selected_workout_exercises') || '[]'),

  clearExerciseSelections: () => {
    localStorage.removeItem('selected_workout_exercises');
  },
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('jwt_token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('jwt_token');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => localStorage.getItem('jwt_token');

export const isAuthenticated = () => !!localStorage.getItem('jwt_token');

export default apiClient;
