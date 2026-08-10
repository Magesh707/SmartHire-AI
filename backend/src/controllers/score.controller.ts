import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AIService, ParsedResume } from '../services/ai.service';
import { formatScore, formatInterviewQuestions, safeParseJson } from '../utils/formatters';

export class ScoreController {
  /**
   * Evaluate / Score a Candidate against a Job manually.
   * Path: POST /score/candidate
   * Body: { candidateId: string, jobId: string }
   */
  static async scoreCandidate(req: AuthenticatedRequest, res: Response) {
    try {
      const { candidateId, jobId } = req.body;

      if (!candidateId || !jobId) {
        return res.status(400).json({ error: 'Missing candidateId or jobId in request body.' });
      }

      // Check candidate
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId }
      });

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate profile not found.' });
      }

      // Check job
      const job = await prisma.job.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job description not found.' });
      }

      // Find or create Application
      let application = await prisma.application.findFirst({
        where: { candidateId, jobId }
      });

      if (!application) {
        application = await prisma.application.create({
          data: {
            candidateId,
            jobId,
            status: 'REVIEW'
          }
        });
      }

      // Map DB candidate structure to AI Service input interface
      const candidateInfo: ParsedResume = {
        name: candidate.name,
        email: candidate.email || '',
        phone: candidate.phone || '',
        location: candidate.location || '',
        skills: safeParseJson<string[]>(candidate.skills, []),
        experience: safeParseJson<any[]>(candidate.experience, []),
        education: safeParseJson<any[]>(candidate.education, []),
        certifications: safeParseJson<string[]>(candidate.certifications, []),
        projects: candidate.projects ? safeParseJson<any[]>(candidate.projects, []) : [],
        languages: safeParseJson<string[]>(candidate.languages, [])
      };

      // Call AI Matching Engine
      const jobInfo = {
        ...job,
        requiredSkills: safeParseJson<string[]>(job.requiredSkills, [])
      };
      const evaluation = await AIService.analyzeCandidate(candidateInfo, jobInfo);

      // Compute Final Score according to formula
      // Final Score = (Skill * 0.4) + (Experience * 0.3) + (Education * 0.2) + (Certification * 0.1)
      const finalScore = Math.round(
        (evaluation.skillMatchScore * 0.4) +
        (evaluation.experienceMatchScore * 0.3) +
        (evaluation.educationMatchScore * 0.2) +
        (evaluation.certificationMatchScore * 0.1)
      );

      // Shortlisting Rules fit category:
      // 90-100 = Excellent Fit, 75-89 = Shortlisted, 50-74 = Review, 0-49 = Rejected
      let fitCategory = 'Rejected';
      let appStatus: 'APPLIED' | 'REVIEW' | 'SHORTLISTED' | 'REJECTED' = 'REJECTED';

      if (finalScore >= 90) {
        fitCategory = 'Excellent Fit';
        appStatus = 'SHORTLISTED';
      } else if (finalScore >= 75) {
        fitCategory = 'Shortlisted';
        appStatus = 'SHORTLISTED';
      } else if (finalScore >= 50) {
        fitCategory = 'Review';
        appStatus = 'REVIEW';
      } else {
        fitCategory = 'Rejected';
        appStatus = 'REJECTED';
      }

      // Update application status
      await prisma.application.update({
        where: { id: application.id },
        data: { status: appStatus }
      });

      // Upsert Score
      const scoreRecord = await prisma.score.upsert({
        where: { applicationId: application.id },
        update: {
          skillMatchScore: evaluation.skillMatchScore,
          experienceMatchScore: evaluation.experienceMatchScore,
          educationMatchScore: evaluation.educationMatchScore,
          certificationMatchScore: evaluation.certificationMatchScore,
          finalScore,
          fitCategory,
          summary: evaluation.summary,
          strengths: JSON.stringify(evaluation.strengths),
          weaknesses: JSON.stringify(evaluation.weaknesses),
          missingSkills: JSON.stringify(evaluation.missingSkills),
          hiringRecommendation: evaluation.hiringRecommendation
        },
        create: {
          applicationId: application.id,
          skillMatchScore: evaluation.skillMatchScore,
          experienceMatchScore: evaluation.experienceMatchScore,
          educationMatchScore: evaluation.educationMatchScore,
          certificationMatchScore: evaluation.certificationMatchScore,
          finalScore,
          fitCategory,
          summary: evaluation.summary,
          strengths: JSON.stringify(evaluation.strengths),
          weaknesses: JSON.stringify(evaluation.weaknesses),
          missingSkills: JSON.stringify(evaluation.missingSkills),
          hiringRecommendation: evaluation.hiringRecommendation
        }
      });

      // Generate and Save Interview Questions
      const questions = await AIService.generateInterviewQuestions(candidateInfo, jobInfo);

      const questionsRecord = await prisma.interviewQuestions.upsert({
        where: { applicationId: application.id },
        update: {
          technicalQuestions: JSON.stringify(questions.technicalQuestions),
          behavioralQuestions: JSON.stringify(questions.behavioralQuestions),
          scenarioQuestions: JSON.stringify(questions.scenarioQuestions)
        },
        create: {
          applicationId: application.id,
          technicalQuestions: JSON.stringify(questions.technicalQuestions),
          behavioralQuestions: JSON.stringify(questions.behavioralQuestions),
          scenarioQuestions: JSON.stringify(questions.scenarioQuestions)
        }
      });

      return res.status(200).json({
        message: 'Evaluation completed successfully.',
        applicationId: application.id,
        status: appStatus,
        score: formatScore(scoreRecord),
        interviewQuestions: formatInterviewQuestions(questionsRecord)
      });
    } catch (error: any) {
      console.error('Score Candidate Error:', error);
      return res.status(500).json({ error: 'Internal server database error scoring candidate' });
    }
  }
}
 