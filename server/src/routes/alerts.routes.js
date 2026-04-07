import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  resetAlert,
  batchCreateAlerts,
  batchUpdateAlerts,
} from '../controllers/alerts.controller.js';

const router = Router();

router.use(protect);

// 批量接口（放在 /:id 之前，避免被 param 路由匹配）
router.post('/batch', validate, batchCreateAlerts);
router.put('/batch', validate, batchUpdateAlerts);

router.get('/', getAlerts);
router.get('/:id', getAlertById);
router.post('/', createAlert, validate);
router.put('/:id', updateAlert, validate);
router.delete('/:id', deleteAlert);
router.post('/:id/reset', resetAlert);

export default router;
