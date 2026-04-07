import { query } from 'express-validator';
import {
  getPortfolioSummaryService,
  getAssetAllocationService,
  getTopPerformersService,
} from '../services/analytics.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getPortfolioSummary = async (req, res) => {
  try {
    const summary = await getPortfolioSummaryService(req.userId);
    return successResponse(res, summary, '获取组合总览成功');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getAssetAllocation = async (req, res) => {
  try {
    const allocation = await getAssetAllocationService(req.userId);
    return successResponse(res, allocation, '获取资产配置成功');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getTopPerformers = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('limit必须在1-10之间'),

  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const performers = await getTopPerformersService(req.userId, limit);
      return successResponse(res, performers, '获取收益排行成功');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
];
