import api from '../services/api';

const workoutAPI = {
  async getAll() {
    const response = await api.get('/api/workouts');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.items || [];
  },

  async create(workoutData) {
    const response = await api.post('/api/workouts', workoutData);
    return response.data?.item || response.data;
  },

  async delete(id) {
    await api.delete(`/api/workouts/${id}`);
  },
};

export default workoutAPI;
