import api from './axios.config';

export const alertsApi = {
  getAll: () => api.get('/alerts'),
  getById: (id) => api.get(`/alerts/${id}`),
  create: (data) => api.post('/alerts', data),
  update: (id, data) => api.put(`/alerts/${id}`, data),
  delete: (id) => api.delete(`/alerts/${id}`),
  reset: (id) => api.post(`/alerts/${id}/reset`),
  batchCreate: (items) => api.post('/alerts/batch', { items }),
  batchUpdate: (ids, action) => api.put('/alerts/batch', { ids, action }),
};
