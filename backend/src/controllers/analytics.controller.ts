import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AnalyticsController {
  static async getDashboardMetrics(req: AuthenticatedRequest, res: Response) {
    try {
      // 1. Core counters
      const totalJobs = await prisma.job.count();
      const totalApplications = await prisma.application.count();
      
      const shortlistedCandidates = await prisma.application.count({
        where: { status: 'SHORTLISTED' }
      });
      
      const rejectedCandidates = await prisma.application.count({
        where: { status: 'REJECTED' }
      });

      const avgScoreResult = await prisma.score.aggregate({
        _avg: {
          finalScore: true
        }
      });
      const averageMatchScore = avgScoreResult._avg.finalScore 
        ? Math.round(avgScoreResult._avg.finalScore * 10) / 10 
        : 0;

      // 2. Chart data: Applications Per Job
      const jobsWithAppCounts = await prisma.job.findMany({
        select: {
          id: true,
          title: true,
          _count: {
            select: { applications: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10 // limit to top 10 recent jobs for chart clarity
      });

      const applicationsPerJob = jobsWithAppCounts.map(job => ({
        jobTitle: job.title.length > 25 ? `${job.title.substring(0, 22)}...` : job.title,
        applicationsCount: job._count.applications
      }));

      // 3. Chart data: Candidate Status Breakdown
      const statusCounts = await prisma.application.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      });

      // Map DB statuses to standard labels for chart display
      const defaultStatuses = {
        APPLIED: 0,
        REVIEW: 0,
        SHORTLISTED: 0,
        REJECTED: 0
      };
      
      statusCounts.forEach(s => {
        if (s.status in defaultStatuses) {
          (defaultStatuses as any)[s.status] = s._count.id;
        }
      });

      const statusBreakdown = [
        { status: 'Applied', count: defaultStatuses.APPLIED },
        { status: 'Review', count: defaultStatuses.REVIEW },
        { status: 'Shortlisted', count: defaultStatuses.SHORTLISTED },
        { status: 'Rejected', count: defaultStatuses.REJECTED }
      ];

      // 4. Chart data: Skill Distribution (Across all Candidates)
      const candidates = await prisma.candidate.findMany({
        select: { skills: true }
      });

      const skillFreq: Record<string, number> = {};
      candidates.forEach(c => {
        let skillsArray: string[] = [];
        try {
          skillsArray = typeof c.skills === 'string' ? JSON.parse(c.skills) : c.skills;
        } catch (e) {
          console.error('Failed to parse candidate skills JSON:', c.skills);
        }

        if (Array.isArray(skillsArray)) {
          skillsArray.forEach(s => {
            const cleanSkill = s.trim();
            if (cleanSkill) {
              // Group variations (e.g. Node vs Node.js vs Nodejs)
              let normalized = cleanSkill;
              const lower = cleanSkill.toLowerCase();
              if (lower === 'js' || lower === 'javascript') normalized = 'JavaScript';
              else if (lower === 'ts' || lower === 'typescript') normalized = 'TypeScript';
              else if (lower === 'node' || lower === 'node.js' || lower === 'nodejs') normalized = 'Node.js';
              else if (lower === 'postgres' || lower === 'postgresql') normalized = 'PostgreSQL';
              else if (lower === 'next' || lower === 'next.js' || lower === 'nextjs') normalized = 'Next.js';
              else if (lower === 'react' || lower === 'reactjs') normalized = 'React';
              else if (lower === 'tailwind' || lower === 'tailwindcss') normalized = 'Tailwind CSS';

              skillFreq[normalized] = (skillFreq[normalized] || 0) + 1;
            }
          });
        }
      });

      const skillDistribution = Object.entries(skillFreq)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Return top 10 skills

      return res.status(200).json({
        metrics: {
          totalJobs,
          totalApplications,
          shortlistedCandidates,
          rejectedCandidates,
          averageMatchScore
        },
        charts: {
          applicationsPerJob,
          statusBreakdown,
          skillDistribution
        }
      });
    } catch (error: any) {
      console.error('Get Analytics Error:', error);
      return res.status(500).json({ error: 'Internal server database error generating analytics datasets' });
    }
  }
}
