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
} from '../controllers/alerts.controller.js';

const router = Router();

router.use(protect);

router.get('/', getAlerts);
router.get('/:id', getAlertById);
router.post('/', createAlert, validate);
router.put('/:id', updateAlert, validate);
router.delete('/:id', deleteAlert);
router.post('/:id/reset', resetAlert);

export default router;
