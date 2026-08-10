import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ParserService } from '../services/parser.service';
import { AIService } from '../services/ai.service';
import { formatCandidate } from '../utils/formatters';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

export const uploadConfig = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      return cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
    cb(null, true);
  }
});

export class ResumeController {
  static async upload(req: AuthenticatedRequest, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      const { jobId } = req.body; // Optional: If provided, auto-link to job and auto-score

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded. Please upload a PDF or DOCX resume.' });
      }

      let job = null;
      if (jobId) {
        job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
          return res.status(404).json({ error: `Job with ID ${jobId} not found.` });
        }
      }

      const results = [];

      for (const file of files) {
        try {
          const relativePath = path.relative(process.cwd(), file.path).replace(/\\/g, '/');
          const ext = path.extname(file.originalname);
          
          // 1. Extract text from PDF/DOCX
          const rawText = await ParserService.parseResume(file.path, ext);
          
          if (!rawText || rawText.trim().length === 0) {
            results.push({
              filename: file.originalname,
              success: false,
              error: 'Failed to extract text. File might be empty or scanned image.'
            });
            continue;
          }

          // 2. Structured parse using Gemini AI
          const parsedData = await AIService.parseResume(rawText);

          // 3. Save Candidate details to Database
          // Check if candidate with email already exists to avoid duplicates
          let candidate = null;
          if (parsedData.email) {
            candidate = await prisma.candidate.findFirst({
              where: { email: parsedData.email }
            });
          }

          if (candidate) {
            // Update existing candidate details
            candidate = await prisma.candidate.update({
              where: { id: candidate.id },
              data: {
                name: parsedData.name || candidate.name,
                phone: parsedData.phone || candidate.phone,
                location: parsedData.location || candidate.location,
                skills: parsedData.skills.length > 0 ? JSON.stringify(parsedData.skills) : candidate.skills,
                experience: parsedData.experience ? JSON.stringify(parsedData.experience) : candidate.experience,
                education: parsedData.education ? JSON.stringify(parsedData.education) : candidate.education,
                certifications: parsedData.certifications.length > 0 ? JSON.stringify(parsedData.certifications) : candidate.certifications,
                projects: parsedData.projects ? JSON.stringify(parsedData.projects) : candidate.projects,
                languages: parsedData.languages.length > 0 ? JSON.stringify(parsedData.languages) : candidate.languages,
                resumePath: relativePath
              }
            });
          } else {
            // Create new candidate
            candidate = await prisma.candidate.create({
              data: {
                name: parsedData.name || 'Unknown Candidate',
                email: parsedData.email || null,
                phone: parsedData.phone || '',
                location: parsedData.location || '',
                skills: JSON.stringify(parsedData.skills),
                experience: JSON.stringify(parsedData.experience || []),
                education: JSON.stringify(parsedData.education || []),
                certifications: JSON.stringify(parsedData.certifications),
                projects: JSON.stringify(parsedData.projects || []),
                languages: JSON.stringify(parsedData.languages),
                resumePath: relativePath
              }
            });
          }

          let application = null;
          let scoring = null;

          // 4. Auto-apply and auto-score if jobId is present
          if (jobId && candidate && job) {
            // Check if application already exists
            application = await prisma.application.findFirst({
              where: {
                candidateId: candidate.id,
                jobId: job.id
              }
            });

            if (!application) {
              application = await prisma.application.create({
                data: {
                  candidateId: candidate.id,
                  jobId: job.id,
                  status: 'REVIEW' // Default to REVIEW state after AI processing
                }
              });
            }

            // Trigger AI Scoring Engine
            const jobInfo = {
              ...job,
              requiredSkills: typeof job.requiredSkills === 'string' ? JSON.parse(job.requiredSkills) as string[] : job.requiredSkills
            };
            const evaluation = await AIService.analyzeCandidate(parsedData, jobInfo);

            // Compute Final Score according to formula
            // Final Score = (Skill * 0.4) + (Experience * 0.3) + (Education * 0.2) + (Certification * 0.1)
            const finalScore = Math.round(
              (evaluation.skillMatchScore * 0.4) +
              (evaluation.experienceMatchScore * 0.3) +
              (evaluation.educationMatchScore * 0.2) +
              (evaluation.certificationMatchScore * 0.1)
            );

            // Determine Shortlisting Rules fit category:
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

            // Save Score
            scoring = await prisma.score.upsert({
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

            // Generate Tailored Interview Questions
            const interviewQA = await AIService.generateInterviewQuestions(parsedData, jobInfo);

            await prisma.interviewQuestions.upsert({
              where: { applicationId: application.id },
              update: {
                technicalQuestions: JSON.stringify(interviewQA.technicalQuestions),
                behavioralQuestions: JSON.stringify(interviewQA.behavioralQuestions),
                scenarioQuestions: JSON.stringify(interviewQA.scenarioQuestions)
              },
              create: {
                applicationId: application.id,
                technicalQuestions: JSON.stringify(interviewQA.technicalQuestions),
                behavioralQuestions: JSON.stringify(interviewQA.behavioralQuestions),
                scenarioQuestions: JSON.stringify(interviewQA.scenarioQuestions)
              }
            });
          }

          results.push({
            filename: file.originalname,
            success: true,
            candidate: {
              id: candidate.id,
              name: candidate.name,
              email: candidate.email
            },
            applicationId: application?.id || null,
            score: scoring?.finalScore || null,
            fitCategory: scoring?.fitCategory || null
          });
        } catch (fileErr: any) {
          console.error(`Error processing file ${file.originalname}:`, fileErr);
          results.push({
            filename: file.originalname,
            success: false,
            error: fileErr.message || 'Error occurred during parsing and processing'
          });
        }
      }

      return res.status(200).json({
        message: `Processed ${files.length} resume(s)`,
        results
      });
    } catch (error: any) {
      console.error('Resume Upload Main Endpoint Error:', error);
      return res.status(500).json({ error: 'Internal server error processing resumes upload' });
    }
  }
}
