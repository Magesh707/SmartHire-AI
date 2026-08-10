import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Get jobs does not strictly require auth or can be accessible to all logged-in recruiters
router.get('/', authenticateJWT as any, JobController.getAll as any);
router.get('/:id', authenticateJWT as any, JobController.getById as any);

router.post('/', authenticateJWT as any, JobController.create as any);
router.put('/:id', authenticateJWT as any, JobController.update as any);
router.delete('/:id', authenticateJWT as any, JobController.delete as any);

export default router;
