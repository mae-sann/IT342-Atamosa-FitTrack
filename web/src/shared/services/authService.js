import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Helper to get token from either storage.
const getStoredToken = () => {
  return sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
};

// Add JWT token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  register: ({ firstName, lastName, email, password, role }) =>
    apiClient.post('/api/auth/register', { firstName, lastName, email, password, role }),

  login: (email, password) =>
    apiClient.post('/api/auth/login', { email, password }),

  loginWithGoogle: (idToken) =>
    apiClient.post('/api/auth/oauth/google', { idToken }),

  logout: () => {
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    localStorage.removeItem('selected_workout_exercises');
    delete apiClient.defaults.headers.common['Authorization'];
    return Promise.resolve();
  },

  getCurrentUser: () =>
    apiClient.get('/api/v1/users/me'),

  updateProfile: (payload) =>
    apiClient.put('/api/v1/users/me', payload),

  changePassword: (payload) =>
    apiClient.post('/api/v1/auth/change-password', payload),

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

export const setAuthToken = (token, rememberMe = false) => {
  if (token) {
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');

    if (rememberMe) {
      localStorage.setItem('jwt_token', token);
    } else {
      sessionStorage.setItem('jwt_token', token);
    }

    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => {
  return sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
};

export const isAuthenticated = () => {
  return !!(sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token'));
};

export default apiClient;
