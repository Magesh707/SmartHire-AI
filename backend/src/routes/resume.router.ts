import { Router } from 'express';
import { ResumeController, uploadConfig } from '../controllers/resume.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Handle resume upload (single or bulk array under 'resumes' parameter name)
router.post(
  '/upload',
  authenticateJWT as any,
  uploadConfig.array('resumes', 10), // Limit bulk upload to 10 resumes at a time
  ResumeController.upload as any
);

export default router;
