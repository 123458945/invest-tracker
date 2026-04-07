import api from './axios.config';

export const holdingsApi = {
  getAll: () => api.get('/holdings'),
  getById: (id) => api.get(`/holdings/${id}`),
  create: (data) => api.post('/holdings', data),
  update: (id, data) => api.put(`/holdings/${id}`, data),
  delete: (id) => api.delete(`/holdings/${id}`),
  batchUpdatePrices: (priceUpdates) => api.post('/holdings/batch-update-prices', { priceUpdates }),
  sell: (data) => api.post('/holdings/sell', data),
  getTransactions: (params) => api.get('/holdings/transactions', { params }),
  getDeletedTransactions: (params) => api.get('/holdings/transactions/deleted', { params }),
  getTransactionStats: () => api.get('/holdings/transactions/stats'),
};
