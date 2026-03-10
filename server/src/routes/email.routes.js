import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { sendTestEmail, sendAlertEmail, isConfigured } from '../services/email.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import getEmailConfig from '../config/email.js';
import Setting from '../models/Setting.js';
import { body, validationResult } from 'express-validator';

const router = Router();

router.use(protect);

router.get('/config', async (req, res) => {
  try {
    const emailConfig = await getEmailConfig(req.userId);
    res.json({
      success: true,
      data: {
        configured: !!(emailConfig.user && emailConfig.pass),
        service: emailConfig.service,
        port: emailConfig.port,
        user: emailConfig.user || '',
      }
    });
  } catch (error) {
    return errorResponse(res, `获取配置失败: ${error.message}`, 500);
  }
});

router.post('/config', [
  body('service').optional().isString(),
  body('port').optional().isInt({ min: 1, max: 65535 }),
  body('user').optional().isString(),
  body('pass').optional().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 400);
  }

  try {
    const { service, port, user, pass } = req.body;
    const userId = req.userId;
    
    const updates = [];
    if (service !== undefined) {
      updates.push(Setting.findOneAndUpdate(
        { userId, key: 'email_service' },
        { userId, key: 'email_service', value: service, category: 'email' },
        { upsert: true, new: true }
      ));
    }
    if (port !== undefined) {
      updates.push(Setting.findOneAndUpdate(
        { userId, key: 'email_port' },
        { userId, key: 'email_port', value: String(port), category: 'email' },
        { upsert: true, new: true }
      ));
    }
    if (user !== undefined) {
      updates.push(Setting.findOneAndUpdate(
        { userId, key: 'email_user' },
        { userId, key: 'email_user', value: user, category: 'email' },
        { upsert: true, new: true }
      ));
    }
    if (pass !== undefined && pass !== '') {
      updates.push(Setting.findOneAndUpdate(
        { userId, key: 'email_pass' },
        { userId, key: 'email_pass', value: pass, category: 'email' },
        { upsert: true, new: true }
      ));
    }

    await Promise.all(updates);

    const emailConfig = await getEmailConfig(userId);
    res.json({
      success: true,
      message: '配置保存成功',
      data: {
        configured: !!(emailConfig.user && emailConfig.pass),
        service: emailConfig.service,
        port: emailConfig.port,
        user: emailConfig.user || '',
      }
    });
  } catch (error) {
    return errorResponse(res, `保存配置失败: ${error.message}`, 500);
  }
});

router.post('/test', [
  body('to').isEmail().withMessage('请输入有效的邮箱地址'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 400);
  }

  const configured = await isConfigured(req.userId);
  if (!configured) {
    return errorResponse(res, '邮件服务未配置，请先配置邮件服务', 400);
  }

  try {
    const result = await sendTestEmail(req.userId, req.body.to);
    if (result.success) {
      return successResponse(res, null, '测试邮件发送成功');
    } else {
      return errorResponse(res, `发送失败: ${result.message}`, 500);
    }
  } catch (error) {
    return errorResponse(res, `发送失败: ${error.message}`, 500);
  }
});

router.post('/alert-test', [
  body('to').isEmail().withMessage('请输入有效的邮箱地址'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 400);
  }

  const configured = await isConfigured(req.userId);
  if (!configured) {
    return errorResponse(res, '邮件服务未配置，请先配置邮件服务', 400);
  }

  const mockAlertData = {
    stockName: '贵州茅台',
    stockCode: '600519',
    alertType: 'price_above',
    targetValue: 1800,
    currentPrice: 1850.50,
  };

  try {
    const result = await sendAlertEmail(req.userId, req.body.to, mockAlertData);
    if (result.success) {
      return successResponse(res, null, '价格提醒测试邮件发送成功');
    } else {
      return errorResponse(res, `发送失败: ${result.message}`, 500);
    }
  } catch (error) {
    return errorResponse(res, `发送失败: ${error.message}`, 500);
  }
});

export default router;
