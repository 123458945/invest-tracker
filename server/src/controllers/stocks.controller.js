import { query, param } from 'express-validator';
import {
  getStockQuoteService,
  searchStocksService,
  getStockMAService,
  updateHoldingPricesService,
  getHistoryClosePriceService,
  fetchKLineData,
} from '../services/marketData.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { validate } from '../middleware/validation.middleware.js';

export const searchStocks = [
  query('keyword')
    .trim()
    .notEmpty().withMessage('搜索关键词不能为空')
    .isLength({ min: 1, max: 20 }).withMessage('关键词长度为1-20个字符'),
  validate,
  async (req, res) => {
    try {
      const stocks = await searchStocksService(req.query.keyword, req.userId);
      return successResponse(res, stocks, '搜索成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
];

export const getStockQuote = [
  param('code')
    .trim()
    .notEmpty().withMessage('股票代码不能为空')
    .isLength({ min: 6, max: 6 }).withMessage('股票代码为6位'),

  async (req, res) => {
    try {
      const market = req.query.market || 'sh';
      const stock = await getStockQuoteService(req.params.code, market);
      return successResponse(res, stock, '获取行情成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
];

export const getStockMA = [
  param('code')
    .trim()
    .notEmpty().withMessage('股票代码不能为空')
    .isLength({ min: 6, max: 6 }).withMessage('股票代码为6位'),

  async (req, res) => {
    try {
      const maData = await getStockMAService(req.params.code);
      return successResponse(res, maData, '获取均线数据成功');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
];

export const updateHoldingPrices = async (req, res) => {
  try {
    const updates = await updateHoldingPricesService(req.userId);
    return successResponse(res, updates, '批量更新价格成功');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getHistoryPrice = [
  param('code')
    .trim()
    .notEmpty().withMessage('股票代码不能为空')
    .isLength({ min: 6, max: 6 }).withMessage('股票代码为6位'),
  query('market')
    .trim()
    .notEmpty().withMessage('市场不能为空')
    .isIn(['sh', 'sz', 'fund']).withMessage('市场类型无效'),
  query('date')
    .trim()
    .notEmpty().withMessage('日期不能为空')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('日期格式应为YYYY-MM-DD'),
  validate,
  async (req, res) => {
    try {
      const { market, date } = req.query;
      console.log(`[History API] Request: code=${req.params.code}, market=${market}, date=${date}`);
      const result = await getHistoryClosePriceService(req.params.code, market, date);
      console.log(`[History API] Success:`, result);
      return successResponse(res, result, '获取历史价格成功');
    } catch (error) {
      console.error(`[History API] Error:`, error.message);
      return errorResponse(res, error.message, 404);
    }
  }
];

export const getKLineData = [
  param('code')
    .trim()
    .notEmpty().withMessage('股票代码不能为空')
    .isLength({ min: 6, max: 6 }).withMessage('股票代码为6位'),
  query('market')
    .trim()
    .notEmpty().withMessage('市场不能为空')
    .isIn(['sh', 'sz']).withMessage('仅支持股票市场'),
  query('count')
    .optional()
    .isInt({ min: 10, max: 500 }).withMessage('数量范围为10-500'),
  validate,
  async (req, res) => {
    try {
      const { market, count } = req.query;
      const kLineCount = count ? parseInt(count) : 70;
      const klineData = await fetchKLineData(req.params.code, market, kLineCount);
      return successResponse(res, klineData, '获取K线数据成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
];
