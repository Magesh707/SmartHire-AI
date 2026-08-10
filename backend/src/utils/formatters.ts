export function safeParseJson<T>(str: any, fallback: T): T {
  if (typeof str !== 'string') return str as T;
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    return fallback;
  }
}

export function formatCandidate(candidate: any) {
  if (!candidate) return null;
  return {
    ...candidate,
    skills: safeParseJson<string[]>(candidate.skills, []),
    experience: safeParseJson<any[]>(candidate.experience, []),
    education: safeParseJson<any[]>(candidate.education, []),
    certifications: safeParseJson<string[]>(candidate.certifications, []),
    projects: candidate.projects ? safeParseJson<any[]>(candidate.projects, []) : [],
    languages: safeParseJson<string[]>(candidate.languages, []),
    applications: candidate.applications ? candidate.applications.map(formatApplication) : undefined
  };
}

export function formatScore(score: any) {
  if (!score) return null;
  return {
    ...score,
    strengths: safeParseJson<string[]>(score.strengths, []),
    weaknesses: safeParseJson<string[]>(score.weaknesses, []),
    missingSkills: safeParseJson<string[]>(score.missingSkills, [])
  };
}

export function formatInterviewQuestions(iq: any) {
  if (!iq) return null;
  return {
    ...iq,
    technicalQuestions: safeParseJson<string[]>(iq.technicalQuestions, []),
    behavioralQuestions: safeParseJson<string[]>(iq.behavioralQuestions, []),
    scenarioQuestions: safeParseJson<string[]>(iq.scenarioQuestions, [])
  };
}

export function formatApplication(app: any) {
  if (!app) return null;
  return {
    ...app,
    candidate: app.candidate ? formatCandidate(app.candidate) : undefined,
    job: app.job ? formatJob(app.job) : undefined,
    score: app.score ? formatScore(app.score) : null,
    interviewQuestions: app.interviewQuestions ? formatInterviewQuestions(app.interviewQuestions) : null
  };
}

export function formatJob(job: any) {
  if (!job) return null;
  return {
    ...job,
    requiredSkills: safeParseJson<string[]>(job.requiredSkills, []),
    applications: job.applications ? job.applications.map(formatApplication) : undefined
  };
}
