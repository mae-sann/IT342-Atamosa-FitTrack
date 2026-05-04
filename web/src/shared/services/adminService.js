import api from './api';

const normalizeExerciseItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

export const adminService = {
  getStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  getUsers: async ({ page = 0, size = 10, search = '' } = {}) => {
    const response = await api.get('/api/admin/users', {
      params: { page, size, search },
    });
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/api/admin/users/${userId}/role`, { role });
    return response.data?.item ?? response.data;
  },

  deleteUser: async (userId) => {
    await api.delete(`/api/admin/users/${userId}`);
  },

  getExercises: async () => {
    const response = await api.get('/api/v1/exercises');
    return normalizeExerciseItems(response.data);
  },

  createExercise: async (payload) => {
    const response = await api.post('/api/v1/exercises', payload);
    return response.data?.item ?? response.data;
  },

  updateExercise: async (exerciseId, payload) => {
    const response = await api.put(`/api/v1/exercises/${exerciseId}`, payload);
    return response.data?.item ?? response.data;
  },

  deleteExercise: async (exerciseId) => {
    await api.delete(`/api/v1/exercises/${exerciseId}`);
  },
};

export default adminService;
