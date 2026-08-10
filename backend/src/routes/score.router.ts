import { Router } from 'express';
import { ScoreController } from '../controllers/score.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Evaluate and calculate candidate match score
router.post('/candidate', authenticateJWT as any, ScoreController.scoreCandidate as any);

export default router;
