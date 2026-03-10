import { body, param, query } from 'express-validator';
import {
  getHoldingsService,
  getHoldingByIdService,
  createHoldingService,
  updateHoldingService,
  deleteHoldingService,
  batchUpdatePricesService,
  sellHoldingService,
  getTransactionsService,
  getDeletedTransactionsService,
  getTransactionStatsService,
} from '../services/holdings.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getDeletedTransactions = [
  query('stockCode').optional().trim(),
  query('type').optional().isIn(['buy', 'sell']).withMessage('类型必须是buy或sell'),
  query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
  query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('限制数量必须在1-500之间'),

  async (req, res) => {
    try {
      const filters = {
        stockCode: req.query.stockCode,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: parseInt(req.query.limit) || 100,
      };
      const transactions = await getDeletedTransactionsService(req.userId, filters);
      return successResponse(res, transactions, '获取已删除交易记录成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
];

export const getHoldings = async (req, res) => {
  try {
    const holdings = await getHoldingsService(req.userId);
    return successResponse(res, holdings, '获取持仓列表成功');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getHoldingById = [
  param('id').isMongoId().withMessage('无效的持仓ID'),
  async (req, res) => {
    try {
      const holding = await getHoldingByIdService(req.params.id, req.userId);
      return successResponse(res, holding, '获取持仓成功');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
];

export const createHolding = [
  body('stockCode')
    .trim()
    .notEmpty().withMessage('股票代码不能为空')
    .isLength({ min: 6, max: 6 }).withMessage('股票代码为6位'),
  body('stockName')
    .optional()
    .trim(),
  body('market')
    .trim()
    .notEmpty().withMessage('市场不能为空')
    .isIn(['sh', 'sz', 'fund']).withMessage('市场必须是sh、sz或fund'),
  body('assetType')
    .optional()
    .isIn(['stock', 'fund']).withMessage('资产类型必须是stock或fund'),
  body('quantity')
    .isFloat({ min: 0 }).withMessage('持仓数量必须大于等于0'),
  body('buyPrice')
    .isFloat({ min: 0 }).withMessage('买入价格必须大于等于0'),
  body('buyDate')
    .isISO8601().withMessage('买入日期格式不正确'),
  body('currentPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('当前价格必须大于等于0'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('备注最多500个字符'),

  async (req, res) => {
    try {
      const holding = await createHoldingService(req.userId, req.body);
      return successResponse(res, holding, '添加持仓成功', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
];

export const sellHolding = [
  body('stockCode')
    .trim()
    .notEmpty().withMessage('股票代码不能为空')
    .isLength({ min: 6, max: 6 }).withMessage('股票代码为6位'),
  body('market')
    .trim()
    .notEmpty().withMessage('市场不能为空')
    .isIn(['sh', 'sz', 'fund']).withMessage('市场必须是sh、sz或fund'),
  body('quantity')
    .isFloat({ min: 0.01 }).withMessage('卖出数量必须大于0'),
  body('sellPrice')
    .isFloat({ min: 0 }).withMessage('卖出价格必须大于等于0'),
  body('sellDate')
    .optional()
    .isISO8601().withMessage('卖出日期格式不正确'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('备注最多500个字符'),

  async (req, res) => {
    try {
      const result = await sellHoldingService(req.userId, req.body);
      return successResponse(res, result, '卖出成功');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
];

export const updateHolding = [
  param('id').isMongoId().withMessage('无效的持仓ID'),
  body('stockCode')
    .optional()
    .trim()
    .notEmpty().withMessage('股票代码不能为空')
    .isLength({ min: 6, max: 6 }).withMessage('股票代码为6位'),
  body('stockName')
    .optional()
    .trim()
    .notEmpty().withMessage('股票名称不能为空'),
  body('market')
    .optional()
    .isIn(['sh', 'sz', 'fund']).withMessage('市场必须是sh、sz或fund'),
  body('assetType')
    .optional()
    .isIn(['stock', 'fund']).withMessage('资产类型必须是stock或fund'),
  body('quantity')
    .optional()
    .isFloat({ min: 0 }).withMessage('持仓数量必须大于等于0'),
  body('avgBuyPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('平均成本必须大于等于0'),
  body('currentPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('当前价格必须大于等于0'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('备注最多500个字符'),

  async (req, res) => {
    try {
      const holding = await updateHoldingService(req.params.id, req.userId, req.body);
      return successResponse(res, holding, '更新持仓成功');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
];

export const deleteHolding = [
  param('id').isMongoId().withMessage('无效的持仓ID'),
  async (req, res) => {
    try {
      await deleteHoldingService(req.params.id, req.userId);
      return successResponse(res, null, '删除持仓成功');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
];

export const batchUpdatePrices = async (req, res) => {
  try {
    const { priceUpdates } = req.body;
    if (!Array.isArray(priceUpdates)) {
      return errorResponse(res, 'priceUpdates必须是数组', 400);
    }
    const results = await batchUpdatePricesService(req.userId, priceUpdates);
    return successResponse(res, results, '批量更新价格成功');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getTransactions = [
  query('stockCode').optional().trim(),
  query('type').optional().isIn(['buy', 'sell']).withMessage('类型必须是buy或sell'),
  query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
  query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('限制数量必须在1-500之间'),

  async (req, res) => {
    try {
      const filters = {
        stockCode: req.query.stockCode,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: parseInt(req.query.limit) || 100,
      };
      const transactions = await getTransactionsService(req.userId, filters);
      return successResponse(res, transactions, '获取交易记录成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
];

export const getTransactionStats = async (req, res) => {
  try {
    const stats = await getTransactionStatsService(req.userId);
    return successResponse(res, stats, '获取交易统计成功');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
