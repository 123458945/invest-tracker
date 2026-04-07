import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  searchStocks,
  getStockQuote,
  getStockMA,
  updateHoldingPrices,
  getHistoryPrice,
  getKLineData,
} from '../controllers/stocks.controller.js';

const router = Router();

router.use(protect);

router.get('/search', searchStocks);
router.get('/:code/history', getHistoryPrice);
router.get('/:code/kline', getKLineData);
router.get('/:code/ma', getStockMA);
router.get('/:code', getStockQuote);
router.post('/update-holdings', updateHoldingPrices);

export default router;
