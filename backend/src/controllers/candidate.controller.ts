import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { formatCandidate } from '../utils/formatters';

export class CandidateController {
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const candidates = await prisma.candidate.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          applications: {
            include: {
              job: {
                select: { title: true }
              },
              score: {
                select: { finalScore: true, fitCategory: true }
              }
            }
          }
        }
      });
      return res.status(200).json({ candidates: candidates.map(formatCandidate) });
    } catch (error: any) {
      console.error('Get All Candidates Error:', error);
      return res.status(500).json({ error: 'Internal server database error fetching candidates' });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const candidate = await prisma.candidate.findUnique({
        where: { id },
        include: {
          applications: {
            include: {
              job: true,
              score: true,
              interviewQuestions: true
            }
          }
        }
      });

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate profile not found' });
      }

      return res.status(200).json({ candidate: formatCandidate(candidate) });
    } catch (error: any) {
      console.error('Get Candidate By Id Error:', error);
      return res.status(500).json({ error: 'Internal server database error fetching candidate profile' });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const candidate = await prisma.candidate.findUnique({ where: { id } });

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      // Delete file from local uploads if it exists
      if (candidate.resumePath) {
        const fullPath = `${process.cwd()}/${candidate.resumePath}`;
        if (require('fs').existsSync(fullPath)) {
          require('fs').unlinkSync(fullPath);
        }
      }

      await prisma.candidate.delete({ where: { id } });

      return res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (error: any) {
      console.error('Delete Candidate Error:', error);
      return res.status(500).json({ error: 'Internal server database error deleting candidate' });
    }
  }
}
