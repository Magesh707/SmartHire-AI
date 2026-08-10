import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateJWT as any, CandidateController.getAll as any);
router.get('/:id', authenticateJWT as any, CandidateController.getById as any);
router.delete('/:id', authenticateJWT as any, CandidateController.delete as any);

export default router;
