'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Globe, 
  FileText,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Play,
  HelpCircle,
  FolderDot
} from 'lucide-react';
import { candidateApi, jobApi, scoreApi } from '../../../utils/api';

export default function CandidateDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [candidate, setCandidate] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]); // To populate "Apply to Job" dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected Application for AI review
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  
  // Scoring / Application linkage form state
  const [targetJobId, setTargetJobId] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  
  // Questions view state
  const [activeQuestionTab, setActiveQuestionTab] = useState<'tech' | 'behavioral' | 'scenario'>('tech');

  const fetchCandidateDetails = async () => {
    try {
      const response = await candidateApi.getById(id);
      setCandidate(response.candidate);
      
      // Auto-select the first application if any
      if (response.candidate.applications && response.candidate.applications.length > 0) {
        setSelectedAppId(response.candidate.applications[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch candidate details.');
    }
  };

  const fetchActiveJobs = async () => {
    try {
      const response = await jobApi.getAll();
      setJobs(response.jobs);
      if (response.jobs.length > 0) {
        setTargetJobId(response.jobs[0].id);
      }
    } catch (err) {
      console.error('Failed to load active jobs dropdown:', err);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchCandidateDetails(), fetchActiveJobs()]);
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleApplyAndScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetJobId) return;

    setEvaluating(true);
    setError('');

    try {
      const response = await scoreApi.evaluate(id, targetJobId);
      // Reload candidate profile to view new score/application
      await fetchCandidateDetails();
      // Select the new application
      if (response.applicationId) {
        setSelectedAppId(response.applicationId);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to trigger AI match scoring: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-3xl text-center">
          <AlertTriangle className="mx-auto mb-3 text-rose-500" size={32} />
          <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">Candidate Profile Not Found</h3>
          <button onClick={() => router.push('/candidates')} className="mt-4 text-sm font-bold text-brand-600 hover:underline">
            Return to Candidates database
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Get active application details
  const activeApp = candidate.applications?.find((app: any) => app.id === selectedAppId);
  const score = activeApp?.score;
  const questions = activeApp?.interviewQuestions;

  // Filter jobs that the candidate hasn't applied to yet
  const availableJobsToApply = jobs.filter(job => 
    !candidate.applications?.some((app: any) => app.jobId === job.id)
  );

  return (
    <DashboardLayout>
      
      {/* Back button and Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <button 
            onClick={() => router.push('/candidates')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition mb-3"
          >
            <ArrowLeft size={14} />
            <span>Back to Candidates</span>
          </button>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{candidate.name}</h2>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
            {candidate.email && (
              <span className="flex items-center gap-1"><Mail size={14} /> {candidate.email}</span>
            )}
            {candidate.phone && (
              <span className="flex items-center gap-1"><Phone size={14} /> {candidate.phone}</span>
            )}
            {candidate.location && (
              <span className="flex items-center gap-1"><MapPin size={14} /> {candidate.location}</span>
            )}
          </div>
        </div>

        {/* View parsed PDF link */}
        {candidate.resumePath && (
          <a
            href={`http://localhost:5000/${candidate.resumePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <FileText size={16} className="text-slate-400" />
            <span>View Resume File</span>
          </a>
        )}
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl">
          {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 units): Candidate Profile Details */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Work Experience */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Briefcase size={20} className="text-brand-500" />
              <span>Work Experience</span>
            </h3>

            {candidate.experience && candidate.experience.length > 0 ? (
              <div className="relative border-l-2 border-slate-100 dark:border-slate-850 ml-3.5 pl-6 space-y-8">
                {candidate.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <span className="absolute -left-[32px] top-1.5 w-3 h-3 bg-brand-500 rounded-full border-2 border-white dark:border-slate-900 shadow" />
                    
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{exp.title}</h4>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{exp.company} • {exp.duration}</p>
                      <p className="text-sm mt-3 leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No experience details parsed.</p>
            )}
          </div>

          {/* Education & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Education */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-md font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <GraduationCap size={18} className="text-brand-500" />
                <span>Education</span>
              </h3>
              {candidate.education && candidate.education.length > 0 ? (
                <div className="space-y-4">
                  {candidate.education.map((edu: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <h4 className="font-bold text-slate-900 dark:text-white">{edu.degree}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{edu.fieldOfStudy}</p>
                      <p className="text-xs text-slate-400 mt-1">{edu.institution} {edu.graduationYear ? `(Graduated ${edu.graduationYear})` : ''}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No education details parsed.</p>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-md font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Award size={18} className="text-brand-500" />
                <span>Certifications</span>
              </h3>
              {candidate.certifications && candidate.certifications.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {candidate.certifications.map((cert: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-2 shrink-0" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">No certifications parsed.</p>
              )}
            </div>

          </div>

          {/* Projects & Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Projects */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-md font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <FolderDot size={18} className="text-brand-500" />
                <span>Key Projects</span>
              </h3>
              {candidate.projects && candidate.projects.length > 0 ? (
                <div className="space-y-4">
                  {candidate.projects.map((proj: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <h4 className="font-bold text-slate-900 dark:text-white">{proj.name}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{proj.description}</p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {proj.technologies.map((t: string, i: number) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-850 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No project details parsed.</p>
              )}
            </div>

            {/* Languages */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-md font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Globe size={18} className="text-brand-500" />
                <span>Languages</span>
              </h3>
              {candidate.languages && candidate.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.languages.map((lang: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No languages parsed.</p>
              )}
            </div>

          </div>

        </div>

        {/* Right Column (5 units): Applications & AI Matching Metrics */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Applications list selection / manual applying */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Job Applications</h3>
            
            {candidate.applications && candidate.applications.length > 0 ? (
              <div className="space-y-2 mb-6">
                {candidate.applications.map((app: any) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between ${
                      app.id === selectedAppId 
                        ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/20' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold truncate max-w-[190px]">{app.job?.title}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold mt-1">Status: {app.status}</p>
                    </div>

                    {app.score ? (
                      <span className={`text-xs font-black px-2 py-1 rounded-lg text-white ${
                        app.score.finalScore >= 90 ? 'bg-emerald-500' :
                        app.score.finalScore >= 75 ? 'bg-blue-500' :
                        app.score.finalScore >= 50 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}>
                        {app.score.finalScore}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        Pending Match
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-6">Candidate is not applied to any job campaign yet.</p>
            )}

            {/* Apply manually section */}
            {availableJobsToApply.length > 0 ? (
              <form onSubmit={handleApplyAndScore} className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Link Candidate to Job Opening
                </label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-semibold outline-none dark:bg-slate-900"
                    value={targetJobId}
                    onChange={(e) => setTargetJobId(e.target.value)}
                  >
                    {availableJobsToApply.map(job => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={evaluating}
                    className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    {evaluating ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Play size={12} />
                        <span>Evaluate</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : jobs.length === 0 ? (
              <p className="text-xs text-slate-400 mt-2">No jobs available to apply to. Create a job campaign first.</p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Linked to all active job campaigns.</p>
            )}
          </div>

          {/* AI Matching Engine Details */}
          {activeApp && (
            <div className="space-y-8">
              
              {/* Parse Scores */}
              {score ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">AI Match Analysis</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Evaluation for: {activeApp.job?.title}</p>
                  </div>

                  {/* Overall score large visualization */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Fit</div>
                      <div className="text-xl font-black mt-0.5">{score.fitCategory}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-400">Score:</span>
                      <span className={`text-2xl font-black px-3 py-1.5 rounded-2xl text-white ${
                        score.finalScore >= 90 ? 'bg-emerald-500' :
                        score.finalScore >= 75 ? 'bg-blue-500' :
                        score.finalScore >= 50 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}>
                        {score.finalScore}%
                      </span>
                    </div>
                  </div>

                  {/* Components breakdown */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Formula Components</h4>
                    
                    {/* Skill Match - 40% */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Skill Match (40% weight)</span>
                        <span className="font-bold">{score.skillMatchScore}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${score.skillMatchScore}%` }} />
                      </div>
                    </div>

                    {/* Experience Match - 30% */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Experience Match (30% weight)</span>
                        <span className="font-bold">{score.experienceMatchScore}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${score.experienceMatchScore}%` }} />
                      </div>
                    </div>

                    {/* Education Match - 20% */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Education Match (20% weight)</span>
                        <span className="font-bold">{score.educationMatchScore}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${score.educationMatchScore}%` }} />
                      </div>
                    </div>

                    {/* Certification Match - 10% */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Certification Match (10% weight)</span>
                        <span className="font-bold">{score.certificationMatchScore}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${score.certificationMatchScore}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Summary paragraph */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Candidate Summary</h4>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{score.summary}</p>
                  </div>

                  {/* Strengths / Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Strengths</h4>
                      <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-350">
                        {score.strengths.map((str: string, i: number) => (
                          <li key={i} className="flex gap-1.5 items-start">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weaknesses</h4>
                      <ul className="space-y-1.5 text-xs text-slate-655 dark:text-slate-355">
                        {score.weaknesses.map((weak: string, i: number) => (
                          <li key={i} className="flex gap-1.5 items-start">
                            <AlertTriangle size={13} className="text-rose-500 shrink-0 mt-0.5" />
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {score.missingSkills && score.missingSkills.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Missing Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {score.missingSkills.map((ms: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-md border border-rose-100/50 dark:border-rose-900/30">
                            {ms}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hiring Recommendation */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 bg-emerald-50/30 dark:bg-emerald-950/10 p-3 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/10">
                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1.5">Hiring Recommendation</h4>
                    <p className="text-xs leading-relaxed text-emerald-900 dark:text-emerald-300 font-medium">{score.hiringRecommendation}</p>
                  </div>

                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center">
                  <Play className="mx-auto mb-3 text-slate-400" size={32} />
                  <h3 className="text-sm font-bold">Evaluation Pending</h3>
                  <p className="text-xs text-slate-400 mt-1.5">Click evaluate above to trigger AI matching analysis for this position.</p>
                </div>
              )}

              {/* Interview Assistant Section */}
              {questions && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">Interview Assistant</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Gemini AI Tailored questions</p>
                  </div>

                  {/* Tabs Selector */}
                  <div className="flex border-b border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setActiveQuestionTab('tech')}
                      className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all ${
                        activeQuestionTab === 'tech'
                          ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-extrabold'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Technical (10)
                    </button>
                    <button
                      onClick={() => setActiveQuestionTab('behavioral')}
                      className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all ${
                        activeQuestionTab === 'behavioral'
                          ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-extrabold'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Behavioral (5)
                    </button>
                    <button
                      onClick={() => setActiveQuestionTab('scenario')}
                      className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all ${
                        activeQuestionTab === 'scenario'
                          ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-extrabold'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Scenario (5)
                    </button>
                  </div>

                  {/* Questions content list */}
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {activeQuestionTab === 'tech' && (
                      <ol className="list-decimal list-inside space-y-3.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                        {(questions.technicalQuestions as string[]).map((q, idx) => (
                          <li key={idx} className="pl-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 ml-1.5">{q}</span>
                          </li>
                        ))}
                      </ol>
                    )}

                    {activeQuestionTab === 'behavioral' && (
                      <ol className="list-decimal list-inside space-y-3.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                        {(questions.behavioralQuestions as string[]).map((q, idx) => (
                          <li key={idx} className="pl-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 ml-1.5">{q}</span>
                          </li>
                        ))}
                      </ol>
                    )}

                    {activeQuestionTab === 'scenario' && (
                      <ol className="list-decimal list-inside space-y-3.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                        {(questions.scenarioQuestions as string[]).map((q, idx) => (
                          <li key={idx} className="pl-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 ml-1.5">{q}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </DashboardLayout>
  );
}
