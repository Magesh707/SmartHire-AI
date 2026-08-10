import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Retrieve aggregate charts and dashboard figures
router.get('/', authenticateJWT as any, AnalyticsController.getDashboardMetrics as any);

export default router;
