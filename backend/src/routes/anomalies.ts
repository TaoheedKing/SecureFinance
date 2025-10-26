import { Router } from 'express';
import {
  getAnomalies,
  getUnacknowledgedAnomalies,
  acknowledgeAnomaly,
  createAnomaly,
} from '../controllers/anomalyController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All anomaly routes require authentication
router.use(authMiddleware);

router.get('/', getAnomalies);
router.get('/unacknowledged', getUnacknowledgedAnomalies);
router.post('/', createAnomaly);
router.patch('/:id/acknowledge', acknowledgeAnomaly);

export default router;
