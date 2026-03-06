import api from './api';

const goalService = {
  getAll: async () => {
    try {
      const res = await api.get('/goals');
      return res.data.data || [];
    } catch (err) {
      console.error('Error fetching goals:', err);
      return [];
    }
  },
  
  getById: async (id) => {
    try {
      const res = await api.get(`/goals/${id}`);
      return res.data.data;
    } catch (err) {
      console.error('Error fetching goal:', err);
      return null;
    }
  },
  
  create: async (data) => {
    try {
      const res = await api.post('/goals', data);
      return res.data.data;
    } catch (err) {
      console.error('Error creating goal:', err);
      throw err;
    }
  },
  
  update: async (id, data) => {
    try {
      const res = await api.put(`/goals/${id}`, data);
      return res.data.data;
    } catch (err) {
      console.error('Error updating goal:', err);
      throw err;
    }
  },
  
  delete: async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      return true;
    } catch (err) {
      console.error('Error deleting goal:', err);
      throw err;
    }
  },
};

export default goalService;
