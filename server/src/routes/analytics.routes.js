import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  getPortfolioSummary,
  getAssetAllocation,
  getTopPerformers,
} from '../controllers/analytics.controller.js';

const router = Router();

router.use(protect);

router.get('/portfolio-summary', getPortfolioSummary);
router.get('/asset-allocation', getAssetAllocation);
router.get('/top-performers', getTopPerformers, validate);

export default router;
