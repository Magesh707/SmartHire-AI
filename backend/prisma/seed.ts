import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting SQLite database seeding...');

  // 1. Clean Database
  await prisma.interviewQuestions.deleteMany({});
  await prisma.score.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@smarthire.ai',
      name: 'System Admin',
      passwordHash,
      role: 'ADMIN'
    }
  });

  const recruiter = await prisma.user.create({
    data: {
      email: 'recruiter@smarthire.ai',
      name: 'Sarah Recruiter',
      passwordHash,
      role: 'RECRUITER'
    }
  });

  console.log('Users created:', { admin: admin.email, recruiter: recruiter.email });

  // 3. Create Jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Senior Frontend Engineer (Next.js)',
      description: 'We are seeking an expert Next.js and React Developer to join our core product team. You will lead UI/UX architecture, optimize client-side core web vitals, and work with modern styling tools like Tailwind CSS. Strong skills in TypeScript and state management (Zustand/Redux) are required.',
      department: 'Engineering',
      location: 'New York, NY (Hybrid)',
      employmentType: 'Full-time',
      requiredSkills: JSON.stringify(['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS', 'Zustand', 'Git']),
      experienceYears: 5,
      educationRequirements: 'Bachelors in Computer Science or equivalent practical experience',
      status: 'OPEN',
      createdById: recruiter.id
    }
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Backend Node.js Engineer (Express/PostgreSQL)',
      description: 'Looking for a backend developer who loves building highly scalable microservices. You will configure and support REST APIs using Node.js, Express, and Prisma ORM. PostgreSQL optimization experience is required. Knowledge of Docker, Redis, and GCP/AWS clouds is a huge plus.',
      department: 'Engineering',
      location: 'San Francisco, CA (Remote)',
      employmentType: 'Full-time',
      requiredSkills: JSON.stringify(['Node.js', 'Express', 'Prisma', 'PostgreSQL', 'SQL', 'Docker', 'REST API', 'TypeScript', 'AWS']),
      experienceYears: 4,
      educationRequirements: 'Bachelors in Computer Science, Software Engineering, or related fields',
      status: 'OPEN',
      createdById: recruiter.id
    }
  });

  const job3 = await prisma.job.create({
    data: {
      title: 'Full Stack Tech Lead',
      description: 'We are hiring a Tech Lead to manage our core web application. Must be proficient in both frontend React/Next.js and backend Node.js. Experience with Prisma, PostgreSQL, Docker, cloud deployment strategies, and technical team leadership is required.',
      department: 'Engineering',
      location: 'London, UK (On-site)',
      employmentType: 'Full-time',
      requiredSkills: JSON.stringify(['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'System Design', 'Agile', 'AWS']),
      experienceYears: 7,
      educationRequirements: 'Bachelors or Masters in Computer Science or related fields',
      status: 'OPEN',
      createdById: recruiter.id
    }
  });

  console.log('Jobs created:', [job1.title, job2.title, job3.title]);

  // 4. Create Candidates
  const candidate1 = await prisma.candidate.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '+1 (555) 012-3456',
      location: 'Boston, MA',
      skills: JSON.stringify(['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'Redux', 'Git', 'Webpack']),
      experience: JSON.stringify([
        {
          title: 'Senior UI Engineer',
          company: 'Logix Labs',
          duration: 'Jan 2022 - Present (4.5 years)',
          description: 'Re-architected the main SaaS dashboard to Next.js, reducing average page load times by 40%.'
        },
        {
          title: 'Frontend Developer',
          company: 'WebCraft Agency',
          duration: 'Jun 2019 - Dec 2021 (2.5 years)',
          description: 'Built beautiful responsive websites for e-commerce customers using React and Tailwind CSS.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          institution: 'Boston University',
          graduationYear: 2019
        }
      ]),
      certifications: JSON.stringify(['Certified React Professional', 'Scrum Alliance ScrumMaster']),
      projects: JSON.stringify([
        {
          name: 'Personal Tailwind Portfolio',
          description: 'A dark-mode custom portfolio featuring animations and optimized loading.',
          technologies: ['Next.js', 'Tailwind CSS']
        }
      ]),
      languages: JSON.stringify(['English', 'French']),
      resumePath: 'uploads/alex_johnson_resume.pdf'
    }
  });

  const candidate2 = await prisma.candidate.create({
    data: {
      name: 'Sophia Patel',
      email: 'sophia.patel@example.com',
      phone: '+1 (555) 234-5678',
      location: 'San Jose, CA',
      skills: JSON.stringify(['Node.js', 'Express', 'Prisma', 'PostgreSQL', 'SQL', 'Docker', 'TypeScript', 'REST API', 'Redis', 'Jest', 'AWS']),
      experience: JSON.stringify([
        {
          title: 'Backend Software Developer',
          company: 'CloudSync Services',
          duration: 'Mar 2021 - Present (5.3 years)',
          description: 'Designed and deployed Node.js backend integrations, managing a data migration of 10M records using Prisma and PostgreSQL.'
        },
        {
          title: 'Junior Software Engineer',
          company: 'CodeForge Technologies',
          duration: 'Aug 2019 - Feb 2021 (1.5 years)',
          description: 'Maintained REST APIs and wrote automated test suites using Jest.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'Bachelor of Engineering',
          fieldOfStudy: 'Software Engineering',
          institution: 'San Jose State University',
          graduationYear: 2019
        }
      ]),
      certifications: JSON.stringify(['AWS Certified Developer Associate']),
      projects: JSON.stringify([
        {
          name: 'Realtime Chat Core',
          description: 'Built a lightweight websocket API for internal office collaboration.',
          technologies: ['Node.js', 'Socket.io', 'Redis']
        }
      ]),
      languages: JSON.stringify(['English', 'Hindi', 'Gujarati']),
      resumePath: 'uploads/sophia_patel_resume.docx'
    }
  });

  const candidate3 = await prisma.candidate.create({
    data: {
      name: 'Marcus Brody',
      email: 'marcus.brody@example.com',
      phone: '+1 (555) 987-6543',
      location: 'Seattle, WA',
      skills: JSON.stringify(['Java', 'C++', 'Python', 'SQL', 'Docker', 'Kubernetes', 'Linux']),
      experience: JSON.stringify([
        {
          title: 'Systems Developer',
          company: 'AeroSystems Co.',
          duration: '2021 - Present (5 years)',
          description: 'Programmed embedded sensor software modules using C++ and managed cloud deployments via Docker.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Electrical Engineering',
          institution: 'University of Washington',
          graduationYear: 2021
        }
      ]),
      certifications: JSON.stringify([]),
      projects: JSON.stringify([]),
      languages: JSON.stringify(['English']),
      resumePath: 'uploads/marcus_brody_resume.pdf'
    }
  });

  console.log('Candidates created:', [candidate1.name, candidate2.name, candidate3.name]);

  // 5. Create Applications
  const app1 = await prisma.application.create({
    data: {
      candidateId: candidate1.id,
      jobId: job1.id,
      status: 'SHORTLISTED'
    }
  });

  const app2 = await prisma.application.create({
    data: {
      candidateId: candidate2.id,
      jobId: job2.id,
      status: 'SHORTLISTED'
    }
  });

  const app3 = await prisma.application.create({
    data: {
      candidateId: candidate3.id,
      jobId: job2.id,
      status: 'REJECTED'
    }
  });

  const app4 = await prisma.application.create({
    data: {
      candidateId: candidate2.id,
      jobId: job3.id,
      status: 'REVIEW'
    }
  });

  console.log('Applications created');

  // 6. Create Scores
  await prisma.score.create({
    data: {
      applicationId: app1.id,
      skillMatchScore: 98,
      experienceMatchScore: 90,
      educationMatchScore: 95,
      certificationMatchScore: 90,
      finalScore: 94,
      fitCategory: 'Excellent Fit',
      summary: 'Alex shows exemplary frontend skills. Core framework matches (React/Next.js) are flawless. Strong portfolio showing experience optimizing web metrics.',
      strengths: JSON.stringify([
        'Extensive React and Next.js production experience.',
        'High skill overlap (98% match).',
        'Strong web vitals optimization history.'
      ]),
      weaknesses: JSON.stringify([
        'Minimal backend development experience.'
      ]),
      missingSkills: JSON.stringify(['Node.js', 'PostgreSQL']),
      hiringRecommendation: 'Alex is a prime candidate. Move immediately to tech screen. Discuss his architectural decisions when implementing Next.js router transitions.'
    }
  });

  await prisma.score.create({
    data: {
      applicationId: app2.id,
      skillMatchScore: 95,
      experienceMatchScore: 92,
      educationMatchScore: 90,
      certificationMatchScore: 95,
      finalScore: 93,
      fitCategory: 'Excellent Fit',
      summary: 'Sophia is an exceptional fit for the backend Node.js engineering position. Detailed ORM and Postgres database knowledge.',
      strengths: JSON.stringify([
        'Expert backend Node.js and SQL capabilities.',
        'Hands-on cloud architecture and Docker experience.',
        'AWS certified developer credential.'
      ]),
      weaknesses: JSON.stringify([
        'Has not highlighted frontend state management tools.'
      ]),
      missingSkills: JSON.stringify(['Next.js']),
      hiringRecommendation: 'Excellent candidate profile. Proceed to interview loop. Focus behavioral questions on handling complex multi-service migrations.'
    }
  });

  await prisma.score.create({
    data: {
      applicationId: app3.id,
      skillMatchScore: 30,
      experienceMatchScore: 40,
      educationMatchScore: 50,
      certificationMatchScore: 0,
      finalScore: 34,
      fitCategory: 'Rejected',
      summary: 'Marcus is a systems engineer but lacks the required Node.js, Express, and modern backend web framework experience required for this profile.',
      strengths: JSON.stringify([
        'Strong systems level engineering background (C/C++).',
        'Familiar with containerization (Docker).'
      ]),
      weaknesses: JSON.stringify([
        'No node backend or javascript/typescript history.',
        'Lacks Prisma and Postgres ORM database integration details.'
      ]),
      missingSkills: JSON.stringify(['Node.js', 'Express', 'Prisma', 'PostgreSQL', 'TypeScript']),
      hiringRecommendation: 'Do not proceed for this web role. Hold profile for internal C++ or infrastructure DevOps opportunities.'
    }
  });

  await prisma.score.create({
    data: {
      applicationId: app4.id,
      skillMatchScore: 80,
      experienceMatchScore: 80,
      educationMatchScore: 85,
      certificationMatchScore: 80,
      finalScore: 81,
      fitCategory: 'Shortlisted',
      summary: 'Sophia has strong backend capability and can handle full-stack components. However, she has less experience in leadership and frontend architecture compared to senior leads.',
      strengths: JSON.stringify([
        'Vast Node.js and AWS cloud infrastructure expertise.',
        'High database and Prisma capabilities.'
      ]),
      weaknesses: JSON.stringify([
        'Lacks dedicated team leadership experience.',
        'Next.js/React frontend capabilities are moderate.'
      ]),
      missingSkills: JSON.stringify(['System Design', 'Agile Product Lifecycle']),
      hiringRecommendation: 'Candidate has potential but might be junior for a full Tech Lead. Consider interviewing for a Senior Software Engineer slot first.'
    }
  });

  console.log('Scores created');

  // 7. Create Interview Questions
  await prisma.interviewQuestions.create({
    data: {
      applicationId: app1.id,
      technicalQuestions: JSON.stringify([
        'Explain server-side rendering (SSR) vs static site generation (SSG) in Next.js. When would you prefer one over the other?',
        'How do you manage client-side state in Next.js 14/15? What are the tradeoffs between Zustand and Context API?',
        'How do you optimize image loading and handle custom fonts in a Tailwind CSS Next.js application?',
        'Describe the React Server Component (RSC) architecture. How do Server and Client components interact?',
        'How would you debug a hydration mismatch error in Next.js?',
        'What is your approach to handling dynamic routes and static paths generation in App Router?',
        'Explain core web vitals (LCP, FID, CLS) and how you optimized them on your recent SaaS project.',
        'What is the difference between standard CSS modules, styled-components, and Tailwind CSS in terms of page loading performance?',
        'How does Next.js middleware function? Show an example use-case for token check route protection.',
        'How do you write clean automated tests for a React hook using React Testing Library?'
      ]),
      behavioralQuestions: JSON.stringify([
        'Tell me about a time you worked with a backend engineer who provided a poorly formatted API. How did you resolve it?',
        'Describe a scenario where you had to push back on a designer\'s UI requirements because of performance issues.',
        'How do you keep your skills up to date with the rapid releases of React/Next.js versions?',
        'Tell me about a time you mentored a junior frontend engineer. What was your strategy?',
        'How do you handle feature requests with extremely tight deadlines?'
      ]),
      scenarioQuestions: JSON.stringify([
        'A user reports that a critical page in our web dashboard crashes on Safari but works on Chrome. How do you troubleshoot?',
        'We need to add complex real-time dashboard notifications. What architecture would you suggest and how would you build it?',
        'The marketing team requests a dynamic CMS for blogs inside our Next.js dashboard app. How do you structure it for SEO?',
        'A bundle analyzer report shows that our main bundle size has doubled. Explain how you would perform code-splitting.',
        'Explain how you would build a multi-tenant client sub-domain system using Next.js middleware routing.'
      ])
    }
  });

  await prisma.interviewQuestions.create({
    data: {
      applicationId: app2.id,
      technicalQuestions: JSON.stringify([
        'Explain event loop in Node.js. How does it handle async database queries under heavy loads?',
        'What is Prisma? Compare it with raw SQL query writes or other ORMs (like Sequelize/Mongoose).',
        'How do you optimize database indexing in PostgreSQL for complex multi-table joins?',
        'What are the advantages of writing APIs using TypeScript over plain Node.js?',
        'Explain REST status codes. When would you choose 409 Conflict vs 422 Unprocessable Entity?',
        'How do you manage connection pooling in Prisma when deploying to serverless functions like AWS Lambda?',
        'Explain how Redis caching works and how you would integrate it to speed up read-heavy APIs.',
        'What security precautions do you implement in Express (e.g. Helmet, CORS limits, rate-limiters)?',
        'How do you design database migration rollbacks using Prisma migrate?',
        'Explain the difference between JWT access tokens and refresh tokens. How are they securely stored?'
      ]),
      behavioralQuestions: JSON.stringify([
        'Describe a situation where your database query update crashed the dev/staging server. How did you react?',
        'Tell me about a time you had to optimize a backend route that was delaying a launch. What was your method?',
        'How do you align database design schemas with frontend product managers\' requirements?',
        'Describe a time you received critical review feedback on your backend pull request. How did you adapt?',
        'Explain a scenario where you took ownership of a legacy, poorly-documented backend codebase.'
      ]),
      scenarioQuestions: JSON.stringify([
        'Our database has hit CPU limits due to slow-running queries. Walk through how you analyze and resolve this.',
        'Explain how you would write a backend file upload flow that processes 100MB files without exhausting server RAM.',
        'Design a high-frequency message queue system using Node.js and a broker (like RabbitMQ or Redis).',
        'We need to securely integrate with a third-party API that has strict request rate-limiting. How do you build a queue/throttler?',
        'How would you manage multi-tenant database isolation in a single PostgreSQL server instance?'
      ])
    }
  });

  console.log('Interview questions created');
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
