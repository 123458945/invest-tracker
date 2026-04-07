import api from './axios.config';

export const stocksApi = {
  search: (keyword) => api.get('/stocks/search', { params: { keyword } }),
  getQuote: (code, market) => api.get(`/stocks/${code}`, { params: { market } }),
  getMA: (code) => api.get(`/stocks/${code}/ma`),
  getKLine: (code, market, count = 70) => api.get(`/stocks/${code}/kline`, { params: { market, count } }),
  updateHoldings: () => api.post('/stocks/update-holdings'),
  getHistoryPrice: (code, market, date) => api.get(`/stocks/${code}/history`, { params: { market, date } }),
};
