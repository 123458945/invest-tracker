import { body, param } from 'express-validator';
import {
  getAlertsService,
  getAlertByIdService,
  createAlertService,
  updateAlertService,
  deleteAlertService,
  resetAlertService,
  batchCreateAlertsService,
  batchUpdateAlertsService,
} from '../services/alerts.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getAlerts = async (req, res) => {
  try {
    const alerts = await getAlertsService(req.userId);
    return successResponse(res, alerts, '获取提醒列表成功');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getAlertById = [
  param('id').isMongoId().withMessage('无效的提醒ID'),
  async (req, res) => {
    try {
      const alert = await getAlertByIdService(req.params.id, req.userId);
      return successResponse(res, alert, '获取提醒成功');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
];

const ALERT_TYPES = [
  'price_above', 'price_below',
  'change_above', 'change_below',
  'ma5_above', 'ma5_below',
  'ma10_above', 'ma10_below',
  'ma20_above', 'ma20_below',
  'ma60_above', 'ma60_below',
];

const MA_ALERT_TYPES = ['ma5_above', 'ma5_below', 'ma10_above', 'ma10_below', 'ma20_above', 'ma20_below', 'ma60_above', 'ma60_below'];

export const createAlert = [
  body('stockCode')
    .trim()
    .notEmpty().withMessage('股票代码不能为空')
    .isLength({ min: 6, max: 6 }).withMessage('股票代码为6位'),
  body('stockName')
    .trim()
    .notEmpty().withMessage('股票名称不能为空'),
  body('market')
    .trim()
    .notEmpty().withMessage('市场不能为空')
    .isIn(['sh', 'sz', 'fund']).withMessage('市场必须是sh、sz或fund'),
  body('alertType')
    .notEmpty().withMessage('提醒类型不能为空')
    .isIn(ALERT_TYPES).withMessage('无效的提醒类型'),
  body('targetValue')
    .optional()
    .isFloat({ min: 0 }).withMessage('目标值必须大于等于0'),
  body('notes')
    .optional()
    .isLength({ max: 200 }).withMessage('备注最多200个字符'),

  async (req, res) => {
    try {
      const alert = await createAlertService(req.userId, req.body);
      return successResponse(res, alert, '创建提醒成功', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
];

export const updateAlert = [
  param('id').isMongoId().withMessage('无效的提醒ID'),
  body('alertType')
    .optional()
    .isIn(ALERT_TYPES).withMessage('无效的提醒类型'),
  body('targetValue')
    .optional()
    .isFloat({ min: 0 }).withMessage('目标值必须大于等于0'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive必须是布尔值'),
  body('notes')
    .optional()
    .isLength({ max: 200 }).withMessage('备注最多200个字符'),

  async (req, res) => {
    try {
      const alert = await updateAlertService(req.params.id, req.userId, req.body);
      return successResponse(res, alert, '更新提醒成功');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
];

export const deleteAlert = [
  param('id').isMongoId().withMessage('无效的提醒ID'),
  async (req, res) => {
    try {
      await deleteAlertService(req.params.id, req.userId);
      return successResponse(res, null, '删除提醒成功');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
];

export const resetAlert = [
  param('id').isMongoId().withMessage('无效的提醒ID'),
  async (req, res) => {
    try {
      const alert = await resetAlertService(req.params.id, req.userId);
      return successResponse(res, alert, '重置提醒成功');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
];

export const batchCreateAlerts = [
  body('items')
    .isArray({ min: 1 }).withMessage('items 必须是非空数组'),
  body('items.*.stockCode')
    .trim()
    .notEmpty().withMessage('股票代码不能为空')
    .isLength({ min: 6, max: 6 }).withMessage('股票代码为6位'),
  body('items.*.stockName')
    .trim()
    .notEmpty().withMessage('股票名称不能为空'),
  body('items.*.market')
    .trim()
    .notEmpty().withMessage('市场不能为空')
    .isIn(['sh', 'sz', 'fund']).withMessage('市场必须是sh、sz或fund'),
  body('items.*.alertType')
    .notEmpty().withMessage('提醒类型不能为空')
    .isIn(ALERT_TYPES).withMessage('无效的提醒类型'),
  body('items.*.targetValue')
    .optional()
    .isFloat({ min: 0 }).withMessage('目标值必须大于等于0'),
  body('items.*.notes')
    .optional()
    .isLength({ max: 200 }).withMessage('备注最多200个字符'),

  async (req, res) => {
    try {
      const result = await batchCreateAlertsService(req.userId, req.body.items);
      return successResponse(res, result, `成功创建 ${result.created} 条提醒${result.skipped > 0 ? `，跳过 ${result.skipped} 条重复` : ''}`, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
];

export const batchUpdateAlerts = [
  body('ids')
    .isArray({ min: 1 }).withMessage('ids 必须是非空数组'),
  body('action')
    .trim()
    .notEmpty().withMessage('操作类型不能为空')
    .isIn(['activate', 'pause', 'delete']).withMessage('操作类型必须是 activate、pause 或 delete'),

  async (req, res) => {
    try {
      const result = await batchUpdateAlertsService(req.userId, req.body.ids, req.body.action);
      return successResponse(res, result, '批量操作成功');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
];
