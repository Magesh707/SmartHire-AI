import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

import authRoutes from './routes/auth.router';
import jobRoutes from './routes/job.router';
import resumeRoutes from './routes/resume.router';
import scoreRoutes from './routes/score.router';
import candidateRoutes from './routes/candidate.router';
import analyticsRoutes from './routes/analytics.router';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for credentials/token authorization
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity, can restrict in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically for download/preview
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Route mountings
app.use('/auth', authRoutes);
app.use('/jobs', jobRoutes);
app.use('/resume', resumeRoutes);
app.use('/score', scoreRoutes);
app.use('/candidates', candidateRoutes);
app.use('/analytics', analyticsRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  
  // Custom check for Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size too large. Upload limit is 10MB.' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'An unexpected error occurred on the server.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`SmartHire AI Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`========================================`);
});
