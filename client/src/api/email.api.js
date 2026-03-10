import api from './axios.config';

export const emailApi = {
  getConfig: () => api.get('/email/config'),
  saveConfig: (data) => api.post('/email/config', data),
  sendTest: (to) => api.post('/email/test', { to }),
  sendAlertTest: (to) => api.post('/email/alert-test', { to }),
};
