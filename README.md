# SmartHire AI - Enterprise-Grade AI Resume Shortlisting ATS System

SmartHire AI is an enterprise-ready Applicant Tracking System (ATS) built with **Next.js 15**, **Express**, **Prisma ORM**, and the **Gemini AI API**. It streamlines recruitment workflows by extracting candidate parameters from uploaded PDF or DOCX resumes, matching candidates against job requisitions, ranking applicants based on weighted scoring matching rules, and compiling custom behavioral, scenario, and technical interview questions.

---

## Technical Stack & Architecture

- **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide icons, responsive tables, SVG telemetry charting grids, Light/Dark theme toggler).
- **Backend**: Node.js + Express (TypeScript, Multer file upload parsing, PDF text extraction via `pdf-parse`, DOCX text extraction via `mammoth`, error handlers).
- **Database**: PostgreSQL (packaged inside docker container orchestration schema) with Prisma ORM client.
- **Authentication**: JWT token storage with local session verification and role-based access checks (`ADMIN`, `RECRUITER`).
- **AI Core**: Gemini API integration (`@google/generative-ai` model `gemini-1.5-flash` with direct JSON validation schemas).
- **File Storage**: Uploads directory mapped locally (structured for easy future AWS S3 mounting).

```
[User / Recruiter]
       │ (Next.js 15 SPA - Dark/Light Mode, Port 3000)
       ▼
[Express Backend API] (Port 5000)
 ├── JWT Auth Middleware & Multer Upload handlers
 ├── PDF/DOCX Parser (pdf-parse / mammoth)
 ├── AI Matching Engine (Gemini 1.5 Flash SDK)
 └── Database Queries (Prisma Client)
       │
       ├─► [Local Disk File Storage] (uploads/ directory)
       └─► [PostgreSQL Database] (Port 5432)
```

---

## Getting Started & Deployment

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Docker Desktop (for database PostgreSQL setup) OR an existing PostgreSQL connection string.

### Step 1: Run PostgreSQL Database
You can spin up the PostgreSQL database in one command using the pre-configured `docker-compose.yml` in the root folder:
```bash
docker compose up -d
```
This spins up PostgreSQL on port `5432` with username `postgres`, password `password`, and database `smarthire`.

### Step 2: Configure Backend Environment
Navigate to `/backend` directory and edit the `.env` file:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/smarthire?schema=public"
JWT_SECRET="smarthire_jwt_secret_key_12345_super_secure_change_me_in_production"
GEMINI_API_KEY="AIzaSy..." # Provide your Gemini API key here
```
*Note: If `GEMINI_API_KEY` is not provided, the system will fall back to a smart mock matching system that extracts email regex and simulates matches so that developers can test all features instantly.*

### Step 3: Run Database Migrations & Seed Data
Inside the `/backend` folder, run npm install and populate the database with seed accounts:
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```
This sets up tables and inserts:
- Recruiter account: `recruiter@smarthire.ai` (Password: `password123`)
- Admin account: `admin@smarthire.ai` (Password: `password123`)
- Sample Job campaigns ("Senior Frontend Engineer", etc.)
- Sample Candidates, application scores, and interview assistant questions.

### Step 4: Run Express Backend
Run the backend Express service:
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

### Step 5: Configure and Run Frontend
Navigate to `/frontend` directory:
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser. You can log in using the recruiter seeder account:
- **Email**: `recruiter@smarthire.ai`
- **Password**: `password123`

---

## AI Prompt Templates & Matching Rules

### 1. Resume Parsing Prompt
Extracts details from raw resume files:
```text
You are an advanced AI Resume Parser. Your job is to extract resume text and map it to a highly structured JSON layout.
Here is the resume plain text:
---
[Resume Text]
---
Please extract the information and output exactly in this JSON structure:
{
  "name": "Candidate Full Name",
  "email": "Email Address",
  "phone": "Phone Number",
  "location": "Location city, state, or country",
  "skills": ["Skill 1", "Skill 2"],
  "experience": [{ "title": "Role/Job", "company": "Company", "duration": "Duration", "description": "Summary" }],
  "education": [{ "degree": "Degree", "fieldOfStudy": "Field", "institution": "University", "graduationYear": 2022 }],
  "certifications": ["Cert 1"],
  "projects": [{ "name": "Project Name", "description": "Description", "technologies": ["Tech 1"] }],
  "languages": ["Language"]
}
```

### 2. Candidate Evaluation & Score Matching Rules
The AI engine evaluates candidates based on the formula:
$$\text{Final Score} = (\text{Skills} \times 0.4) + (\text{Experience} \times 0.3) + (\text{Education} \times 0.2) + (\text{Certifications} \times 0.1)$$

Category shortlisting fits:
- **90-100**: `Excellent Fit` (Move to shortlist status)
- **75-89**: `Shortlisted` (Move to shortlist status)
- **50-74**: `Review` (Hold for recruiter manual check)
- **0-49**: `Rejected` (Reject applicant status)

Prompt used to match parameters:
```text
You are an ATS Match Engine. Evaluate the candidate's parsed details against the specified job description.
Assess the following components (each from 0 to 100):
1. skillMatchScore: Skill alignment with required skills.
2. experienceMatchScore: Work history alignment.
3. educationMatchScore: Degree alignment.
4. certificationMatchScore: Certification alignment.

Output exactly the following JSON structure:
{
  "skillMatchScore": 85,
  "experienceMatchScore": 75,
  "educationMatchScore": 90,
  "certificationMatchScore": 60,
  "summary": "Match evaluation summary text.",
  "strengths": ["Strength 1"],
  "weaknesses": ["Weakness 1"],
  "missingSkills": ["Skill missing"],
  "hiringRecommendation": "Hiring recommendation note."
}
```

---

## API Documentation

### Auth Endpoints
- `POST /auth/register` - Create recruiter/admin accounts.
- `POST /auth/login` - Obtain JWT token.
- `GET /auth/me` - Authenticate current session.

### Job Campaign Endpoints
- `POST /jobs` - Add a job opening.
- `GET /jobs` - List all open and closed campaigns.
- `GET /jobs/:id` - Fetch details for a specific campaign, including applicant rankings.
- `PUT /jobs/:id` - Edit specs.
- `DELETE /jobs/:id` - Remove campaign.

### Resume Upload Endpoints
- `POST /resume/upload` - Upload PDF/DOCX (Accepts multipart `resumes` array and optional `jobId`).

### Candidate Evaluation Endpoints
- `POST /score/candidate` - Manually evaluate a candidate against a job.
- `GET /candidates` - List global candidate directory.
- `GET /candidates/:id` - Fetch candidate details, work history, and AI matching analytics.

### Analytics Endpoints
- `GET /analytics` - Aggregate status breakdown ratios and applications stats.
