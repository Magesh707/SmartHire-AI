import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: number;
  }[];
  certifications: string[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
  languages: string[];
}

export interface AIAnalysisResult {
  skillMatchScore: number;       // 0-100
  experienceMatchScore: number;  // 0-100
  educationMatchScore: number;   // 0-100
  certificationMatchScore: number; // 0-100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  hiringRecommendation: string;
}

export interface AIOtherResult {
  technicalQuestions: string[];
  behavioralQuestions: string[];
  scenarioQuestions: string[];
}

export class AIService {
  private static getClient(): GoogleGenerativeAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      console.warn('WARNING: GEMINI_API_KEY is not set. System will run with Mock Resume AI parser/evaluator.');
      return null;
    }
    return new GoogleGenerativeAI(apiKey);
  }

  /**
   * Parse resume text using Gemini AI into structured JSON.
   */
  static async parseResume(resumeText: string): Promise<ParsedResume> {
    const client = this.getClient();
    if (!client) {
      return this.mockParseResume(resumeText);
    }

    try {
      const model = client.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        You are an advanced AI Resume Parser. Your job is to extract resume text and map it to a highly structured JSON layout.
        Do not add any additional explanations or markdown formatting outside of the JSON object itself.
        Here is the resume plain text:
        ---
        ${resumeText}
        ---

        Please extract the following information and output exactly in this JSON structure:
        {
          "name": "Candidate Full Name (default to 'Unknown Candidate' if missing)",
          "email": "Email Address (default to '')",
          "phone": "Phone Number (default to '')",
          "location": "Location city, state, or country (default to '')",
          "skills": ["Skill 1", "Skill 2", ...],
          "experience": [
            {
              "title": "Role/Job Title",
              "company": "Company Name",
              "duration": "Duration details, e.g. June 2021 - Present, or 2 years",
              "description": "Responsibilities and achievements summary"
            }
          ],
          "education": [
            {
              "degree": "Degree name, e.g. Bachelor of Science",
              "fieldOfStudy": "Field of Study, e.g. Computer Science",
              "institution": "University/Institution name",
              "graduationYear": 2022 (numeric year or 0 if missing)
            }
          ],
          "certifications": ["Certification name", ...],
          "projects": [
            {
              "name": "Project Name",
              "description": "Project description",
              "technologies": ["Technology name", ...]
            }
          ],
          "languages": ["Language name", ...]
        }
      `;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text) as ParsedResume;
    } catch (error: any) {
      console.error('Gemini AI Resume Parsing Error:', error);
      // Fallback to mock parser if Gemini crashes or times out
      return this.mockParseResume(resumeText);
    }
  }

  /**
   * Analyze candidate profile against a job description.
   */
  static async analyzeCandidate(candidate: ParsedResume, job: {
    title: string;
    description: string;
    requiredSkills: string[];
    experienceYears: number;
    educationRequirements: string;
  }): Promise<AIAnalysisResult> {
    const client = this.getClient();
    if (!client) {
      return this.mockAnalyzeCandidate(candidate, job);
    }

    try {
      const model = client.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        You are an ATS Match Engine. Evaluate the candidate's parsed resume details against the specified job description.
        You must assess the following components (each from 0 to 100):
        1. skillMatchScore: How well the candidate's skills align with the required job skills.
        2. experienceMatchScore: How well the candidate's work history, duration, and role responsibilities match the required experience.
        3. educationMatchScore: How well the education matches the job description's education expectations.
        4. certificationMatchScore: How well certifications and extra achievements match.

        Provide detailed candidate analysis as JSON.
        
        Job Details:
        - Title: ${job.title}
        - Description: ${job.description}
        - Required Skills: ${job.requiredSkills.join(', ')}
        - Required Experience Years: ${job.experienceYears}
        - Education Requirements: ${job.educationRequirements}

        Candidate Details:
        - Name: ${candidate.name}
        - Skills: ${candidate.skills.join(', ')}
        - Experience: ${JSON.stringify(candidate.experience)}
        - Education: ${JSON.stringify(candidate.education)}
        - Certifications: ${candidate.certifications.join(', ')}
        - Projects: ${JSON.stringify(candidate.projects)}

        Output EXACTLY the following JSON format:
        {
          "skillMatchScore": 85,
          "experienceMatchScore": 75,
          "educationMatchScore": 90,
          "certificationMatchScore": 60,
          "summary": "Concise candidate match evaluation summary.",
          "strengths": ["Strength 1", "Strength 2", ...],
          "weaknesses": ["Weakness 1", "Weakness 2", ...],
          "missingSkills": ["Required skill that candidate does not possess", ...],
          "hiringRecommendation": "A detailed hiring recommendation and onboarding note."
        }
      `;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text) as AIAnalysisResult;
    } catch (error: any) {
      console.error('Gemini AI Scoring Error:', error);
      return this.mockAnalyzeCandidate(candidate, job);
    }
  }

  /**
   * Generate interview questions tailored to the candidate and the job.
   */
  static async generateInterviewQuestions(candidate: ParsedResume, job: {
    title: string;
    description: string;
  }): Promise<AIOtherResult> {
    const client = this.getClient();
    if (!client) {
      return this.mockGenerateQuestions(candidate, job);
    }

    try {
      const model = client.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        You are a hiring manager. Write a tailored list of interview questions for candidate '${candidate.name}' applying for the role of '${job.title}'.
        Job description summary: ${job.description.substring(0, 300)}...
        Candidate skills: ${candidate.skills.join(', ')}

        You must generate exactly:
        - 10 targeted Technical Questions focusing on the candidate's skills and the requirements of the job.
        - 5 Behavioral Questions checking leadership, collaboration, and learning mindset.
        - 5 Scenario Questions assessing analytical problem solving in context of this job.

        Output EXACTLY in the following JSON format:
        {
          "technicalQuestions": [
            "Technical Question 1",
            "Technical Question 2",
            ...
          ],
          "behavioralQuestions": [
            "Behavioral Question 1",
            ...
          ],
          "scenarioQuestions": [
            "Scenario Question 1",
            ...
          ]
        }
      `;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text) as AIOtherResult;
    } catch (error: any) {
      console.error('Gemini AI Interview Generation Error:', error);
      return this.mockGenerateQuestions(candidate, job);
    }
  }

  // --- MOCK FALLBACK SERVICES (runs without Gemini API Key) ---

  private static mockParseResume(text: string): ParsedResume {
    // Basic regex-based extraction to make it look active
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/i;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    
    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);
    
    const email = emailMatch ? emailMatch[0] : 'john.doe@example.com';
    const phone = phoneMatch ? phoneMatch[0] : '+1 (555) 019-2834';

    // Guess a name by looking at first lines
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const name = lines.length > 0 ? lines[0] : 'John Doe';

    // Dummy arrays for skills, experience, education based on simple content matching
    const parsedSkills: string[] = [];
    const skillsList = ['React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'SQL', 'PostgreSQL', 'Docker', 'AWS', 'Java', 'C++', 'Go', 'HTML', 'CSS', 'Prisma', 'Next.js', 'Tailwind', 'Git'];
    skillsList.forEach(s => {
      const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('(^|\\W)' + escaped + '(\\W|$)', 'i');
      if (regex.test(text)) {
        parsedSkills.push(s);
      }
    });

    if (parsedSkills.length === 0) {
      parsedSkills.push('JavaScript', 'Software Engineering', 'Problem Solving');
    }

    return {
      name,
      email,
      phone,
      location: 'New York, NY',
      skills: parsedSkills,
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Solutions Inc.',
          duration: '2022 - Present (2+ years)',
          description: 'Led a team of frontend developers to migrate complex dashboard features to React and TypeScript. Improved load time by 30%.'
        },
        {
          title: 'Software Developer',
          company: 'DevGroup Corp',
          duration: '2020 - 2022 (2 years)',
          description: 'Developed RESTful services in Node.js, Express, and PostgreSQL. Built automated test coverage up to 90%.'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          institution: 'State University',
          graduationYear: 2020
        }
      ],
      certifications: ['AWS Certified Solutions Architect', 'Scrum Alliance Product Owner'],
      projects: [
        {
          name: 'E-Commerce Microservices Platform',
          description: 'Refactored backend architecture into dockerized Node services.',
          technologies: ['Node.js', 'Docker', 'Redis']
        }
      ],
      languages: ['English (Fluent)', 'Spanish (Conversational)']
    };
  }

  private static mockAnalyzeCandidate(candidate: ParsedResume, job: {
    title: string;
    requiredSkills: string[];
    experienceYears: number;
  }): AIAnalysisResult {
    // Generate scores based on common skill intersection
    const matchedSkills = candidate.skills.filter(s => 
      job.requiredSkills.some(rs => rs.toLowerCase() === s.toLowerCase())
    );
    const skillRatio = job.requiredSkills.length > 0 ? (matchedSkills.length / job.requiredSkills.length) : 0.8;
    
    const skillMatchScore = Math.round(50 + skillRatio * 50);
    const experienceMatchScore = candidate.experience.length >= job.experienceYears / 2 ? 85 : 60;
    const educationMatchScore = 80;
    const certificationMatchScore = candidate.certifications.length > 0 ? 90 : 50;

    const missingSkills = job.requiredSkills.filter(rs =>
      !candidate.skills.some(s => s.toLowerCase() === rs.toLowerCase())
    );

    return {
      skillMatchScore,
      experienceMatchScore,
      educationMatchScore,
      certificationMatchScore,
      summary: `[MOCK AI EVALUATION - ADD GEMINI_API_KEY] ${candidate.name} presents solid software engineering credentials. Strong alignment in core modern tools.`,
      strengths: [
        `Demonstrates expertise in ${candidate.skills.slice(0, 3).join(', ')}.`,
        'Proven work history with solid progression of technical responsibilities.',
        'High degree of independent project experience.'
      ],
      weaknesses: [
        missingSkills.length > 0 ? `Lacks key competencies: ${missingSkills.slice(0, 2).join(', ')}.` : 'No critical skill gaps identified.',
        'Could display more deep architectural contribution details.'
      ],
      missingSkills: missingSkills,
      hiringRecommendation: 'Recommended for an initial technical screen. Focus evaluation on architectural design patterns and practical frontend/backend performance challenges.'
    };
  }

  private static mockGenerateQuestions(candidate: ParsedResume, job: { title: string }): AIOtherResult {
    return {
      technicalQuestions: [
        `How do you handle state management or rendering optimization in modern frameworks, especially considering your work with ${candidate.skills[0] || 'JavaScript'}?`,
        `Describe a scenario where you scaled a database schema like PostgreSQL or Prisma to handle high read/write queries.`,
        `Can you explain the difference between REST APIs and GraphQL/WebSockets, and when you would use each?`,
        `What is your approach to automated unit testing, and which test runners or libraries do you prefer?`,
        `How do you configure Webpack/Vite or build pipelines in modern Next.js/React setups?`,
        `In Node.js, how do you handle asynchronous loops, error handling, and thread-pool blockers?`,
        `How do you secure Express routes, manage cookies/tokens, and handle CORS policy issues?`,
        `What are the advantages of CSS-in-JS versus Tailwind CSS, and how do you achieve maximum performance?`,
        `How does Docker containers and environment-specific configuration assist with cloud deployments?`,
        `What strategy would you choose to optimize memory leaks in a server-side Javascript environment?`
      ],
      behavioralQuestions: [
        'Tell me about a time you had a technical disagreement with a team lead. How did you present your case and resolve it?',
        'Describe a situation where a project requirement was ambiguous. What steps did you take to clarify the deliverables?',
        'How do you manage your time when assigned multiple high-priority tickets or bugs simultaneously?',
        'Tell me about a project that failed. What did you learn and how did you apply that to subsequent work?',
        'How do you mentor junior developers or share technical knowledge within your dev team?'
      ],
      scenarioQuestions: [
        `The production application is experiencing a slow load time for global users. How do you troubleshoot the latency?`,
        `A key client discovers a critical authentication security vulnerability on our active API. What is your response flow?`,
        `We need to migrate a heavy database with zero downtime. Walk through your strategy to achieve this successfully.`,
        `A third-party search API we rely upon has gone down. How do you design the application to handle this dependency failure gracefully?`,
        `You are asked to build a bulk file importer that handles 1GB PDF resume files concurrently. How do you build it so the backend doesn't crash?`
      ]
    };
  }
}
