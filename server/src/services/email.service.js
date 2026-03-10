import nodemailer from 'nodemailer';
import getEmailConfig from '../config/email.js';
import logger from '../utils/logger.js';

const createTransporter = async (userId) => {
  const emailConfig = await getEmailConfig(userId);
  return nodemailer.createTransport({
    host: emailConfig.service,
    port: emailConfig.port,
    secure: emailConfig.port === 465,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: true,
    logger: true,
  });
};

const isConfigured = async (userId) => {
  const emailConfig = await getEmailConfig(userId);
  return !!(emailConfig.user && emailConfig.pass);
};

export const sendAlertEmail = async (userId, to, alertData) => {
  const emailConfig = await getEmailConfig(userId);
  if (!emailConfig.user || !emailConfig.pass) {
    logger.warn('邮件服务未配置，跳过发送邮件');
    return { success: false, message: '邮件服务未配置' };
  }

  const transporter = await createTransporter(userId);

  const alertTypeText = {
    price_above: '价格高于',
    price_below: '价格低于',
    change_above: '涨幅高于',
    change_below: '跌幅低于',
    ma5_above: '价格上穿MA5',
    ma5_below: '价格下破MA5',
    ma10_above: '价格上穿MA10',
    ma10_below: '价格下破MA10',
    ma20_above: '价格上穿MA20',
    ma20_below: '价格下破MA20',
    ma60_above: '价格上穿MA60',
    ma60_below: '价格下破MA60',
  };

  const subject = `[InvestTracker] ${alertData.stockName}(${alertData.stockCode}) 价格提醒`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">价格提醒通知</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${alertData.stockName} (${alertData.stockCode})</h3>
        <p><strong>提醒条件：</strong>${alertTypeText[alertData.alertType] || alertData.alertType} ${alertData.targetValue}${alertData.alertType.includes('change') ? '%' : '元'}</p>
        <p><strong>当前价格：</strong>¥${alertData.currentPrice}</p>
        <p><strong>触发时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
      </div>
      <p style="color: #666; font-size: 12px;">此邮件由 InvestTracker 自动发送，请勿回复。</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"InvestTracker" <${emailConfig.user}>`,
      to,
      subject,
      html,
    });
    logger.info(`邮件发送成功: ${to}`);
    return { success: true };
  } catch (error) {
    logger.error(`邮件发送失败: ${error.message}`);
    return { success: false, message: error.message };
  }
};

export const sendTestEmail = async (userId, to) => {
  const emailConfig = await getEmailConfig(userId);
  logger.info(`准备发送测试邮件，配置信息: host=${emailConfig.service}, port=${emailConfig.port}, user=${emailConfig.user}`);
  
  const transporter = await createTransporter(userId);

  try {
    await transporter.sendMail({
      from: `"InvestTracker" <${emailConfig.user}>`,
      to,
      subject: '[InvestTracker] 测试邮件',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">测试邮件</h2>
          <p>这是一封测试邮件，如果您收到此邮件，说明邮件服务配置正确。</p>
          <p style="color: #666; font-size: 12px;">发送时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>
      `,
    });
    logger.info(`测试邮件发送成功: ${to}`);
    return { success: true };
  } catch (error) {
    logger.error(`测试邮件发送失败: ${error.message}`, { error: error.stack, config: { host: emailConfig.service, port: emailConfig.port, user: emailConfig.user } });
    return { success: false, message: error.message };
  }
};

export { isConfigured };
