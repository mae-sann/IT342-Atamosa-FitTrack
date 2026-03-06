import api from './api';

const workoutService = {
  getRecent: async (limit = 3) => {
    try {
      const res = await api.get(`/workouts?limit=${limit}`);
      return res.data.data || [];
    } catch (err) {
      console.error('Error fetching workouts:', err);
      return [];
    }
  },
  
  getAll: async () => {
    try {
      const res = await api.get('/workouts');
      return res.data.data || [];
    } catch (err) {
      console.error('Error fetching workouts:', err);
      return [];
    }
  },
  
  getById: async (id) => {
    try {
      const res = await api.get(`/workouts/${id}`);
      return res.data.data;
    } catch (err) {
      console.error('Error fetching workout:', err);
      return null;
    }
  },
  
  create: async (data) => {
    try {
      const res = await api.post('/workouts', data);
      return res.data.data;
    } catch (err) {
      console.error('Error creating workout:', err);
      throw err;
    }
  },
  
  update: async (id, data) => {
    try {
      const res = await api.put(`/workouts/${id}`, data);
      return res.data.data;
    } catch (err) {
      console.error('Error updating workout:', err);
      throw err;
    }
  },
  
  delete: async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      return true;
    } catch (err) {
      console.error('Error deleting workout:', err);
      throw err;
    }
  },
};

export default workoutService;
