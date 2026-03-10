import Setting from '../models/Setting.js';

const getEmailConfig = async (userId) => {
  const settings = await Setting.find({ userId, category: 'email' });
  const config = {};
  
  settings.forEach(setting => {
    config[setting.key] = setting.value;
  });
  
  return {
    service: config.email_service || process.env.EMAIL_SERVICE || 'smtp.qq.com',
    port: parseInt(config.email_port) || parseInt(process.env.EMAIL_PORT) || 465,
    user: config.email_user || process.env.EMAIL_USER || '',
    pass: config.email_pass || process.env.EMAIL_PASS || '',
  };
};

export const getEmailConfigSync = () => {
  return {
    service: process.env.EMAIL_SERVICE || 'smtp.qq.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  };
};

export default getEmailConfig;
