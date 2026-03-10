import api from './axios.config';

export const analyticsApi = {
  getPortfolioSummary: () => api.get('/analytics/portfolio-summary'),
  getAssetAllocation: () => api.get('/analytics/asset-allocation'),
  getTopPerformers: (limit = 5) => api.get('/analytics/top-performers', { params: { limit } }),
};
