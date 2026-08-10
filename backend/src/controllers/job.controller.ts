import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { formatJob } from '../utils/formatters';

export class JobController {
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, department, location, employmentType, requiredSkills, experienceYears, educationRequirements } = req.body;

      if (!title || !description || !employmentType || !requiredSkills || experienceYears === undefined || !educationRequirements) {
        return res.status(400).json({ error: 'Missing required job fields' });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const job = await prisma.job.create({
        data: {
          title,
          description,
          department: department || '',
          location: location || '',
          employmentType,
          requiredSkills: JSON.stringify(Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map((s: string) => s.trim())),
          experienceYears: parseInt(experienceYears, 10),
          educationRequirements,
          createdById: req.user.id
        }
      });

      return res.status(201).json({ message: 'Job created successfully', job: formatJob(job) });
    } catch (error: any) {
      console.error('Create Job Error:', error);
      return res.status(500).json({ error: 'Internal server database error during job creation' });
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const jobs = await prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { applications: true }
          }
        }
      });
      return res.status(200).json({ jobs: jobs.map(formatJob) });
    } catch (error: any) {
      console.error('Get All Jobs Error:', error);
      return res.status(500).json({ error: 'Internal server database error fetching jobs' });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          applications: {
            include: {
              candidate: true,
              score: true
            },
            orderBy: {
              score: {
                finalScore: 'desc'
              }
            }
          }
        }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      return res.status(200).json({ job: formatJob(job) });
    } catch (error: any) {
      console.error('Get Job By Id Error:', error);
      return res.status(500).json({ error: 'Internal server database error fetching job details' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, department, location, employmentType, requiredSkills, experienceYears, educationRequirements, status } = req.body;

      const job = await prisma.job.findUnique({ where: { id } });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Check if user owns the job or is admin
      if (req.user?.role !== 'ADMIN' && job.createdById !== req.user?.id) {
        return res.status(403).json({ error: 'Permission denied. You can only update jobs created by yourself.' });
      }

      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          title: title !== undefined ? title : job.title,
          description: description !== undefined ? description : job.description,
          department: department !== undefined ? department : job.department,
          location: location !== undefined ? location : job.location,
          employmentType: employmentType !== undefined ? employmentType : job.employmentType,
          requiredSkills: requiredSkills !== undefined 
            ? JSON.stringify(Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map((s: string) => s.trim()))
            : job.requiredSkills,
          experienceYears: experienceYears !== undefined ? parseInt(experienceYears, 10) : job.experienceYears,
          educationRequirements: educationRequirements !== undefined ? educationRequirements : job.educationRequirements,
          status: status !== undefined ? status : job.status
        }
      });

      return res.status(200).json({ message: 'Job updated successfully', job: formatJob(updatedJob) });
    } catch (error: any) {
      console.error('Update Job Error:', error);
      return res.status(500).json({ error: 'Internal server database error updating job' });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const job = await prisma.job.findUnique({ where: { id } });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Check if user owns the job or is admin
      if (req.user?.role !== 'ADMIN' && job.createdById !== req.user?.id) {
        return res.status(403).json({ error: 'Permission denied. You can only delete jobs created by yourself.' });
      }

      await prisma.job.delete({ where: { id } });

      return res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error: any) {
      console.error('Delete Job Error:', error);
      return res.status(500).json({ error: 'Internal server database error deleting job' });
    }
  }
}
