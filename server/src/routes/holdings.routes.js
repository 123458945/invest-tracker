import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  getHoldings,
  getHoldingById,
  createHolding,
  updateHolding,
  deleteHolding,
  batchUpdatePrices,
  sellHolding,
  getTransactions,
  getDeletedTransactions,
  getTransactionStats,
} from '../controllers/holdings.controller.js';

const router = Router();

router.use(protect);

router.get('/', getHoldings);
router.get('/transactions', getTransactions, validate);
router.get('/transactions/deleted', getDeletedTransactions, validate);
router.get('/transactions/stats', getTransactionStats);
router.get('/:id', getHoldingById);
router.post('/', createHolding, validate);
router.post('/sell', sellHolding, validate);
router.put('/:id', updateHolding, validate);
router.delete('/:id', deleteHolding);
router.post('/batch-update-prices', batchUpdatePrices);

export default router;
