'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  UploadCloud, 
  FileText, 
  ExternalLink,
  Percent,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';
import { jobApi, resumeApi, scoreApi } from '../../../utils/api';

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchJobDetails = async () => {
    try {
      const response = await jobApi.getById(id);
      setJob(response.job);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load job details. Job campaign may not exist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadResults(null);
    setError('');

    const formData = new FormData();
    formData.append('jobId', id);
    for (let i = 0; i < files.length; i++) {
      formData.append('resumes', files[i]);
    }

    try {
      const response = await resumeApi.upload(formData);
      setUploadResults(response.results);
      // Refresh details to load new candidates
      await fetchJobDetails();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred uploading resumes.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerManualEvaluation = async (candidateId: string) => {
    try {
      await scoreApi.evaluate(candidateId, id);
      await fetchJobDetails();
    } catch (err: any) {
      console.error(err);
      alert('Failed to trigger AI scoring: ' + err.message);
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

  if (!job) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-3xl text-center">
          <AlertTriangle className="mx-auto mb-3 text-rose-500" size={32} />
          <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">Job Not Found</h3>
          <button onClick={() => router.push('/jobs')} className="mt-4 text-sm font-bold text-brand-600 hover:underline">
            Return to list
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      
      {/* Back button and summary header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/jobs')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition mb-3"
        >
          <ArrowLeft size={14} />
          <span>Back to Campaigns</span>
        </button>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{job.title}</h2>
        <p className="text-xs text-slate-400 mt-1 capitalize">{job.department} department • {job.employmentType}</p>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl">
          {error}
        </div>
      )}

      {/* Grid: Left Column Job details, Right Column Resume drop box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Job Details Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">Requirements Specs</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
              <MapPin size={18} className="text-slate-400 shrink-0" />
              <span>{job.location || 'Remote'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
              <Clock size={18} className="text-slate-400 shrink-0" />
              <span>Min {job.experienceYears} Years Exp</span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Education Expectations</h4>
              <p className="text-sm leading-relaxed">{job.educationRequirements}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-100 dark:border-slate-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Description</h4>
              <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">{job.description}</p>
            </div>
          </div>
        </div>

        {/* Upload Resume Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Upload Resumes</h3>
            <p className="text-xs text-slate-400 mb-6">Auto-apply and score candidates against this job description</p>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            >
              <input 
                type="file" 
                multiple
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf,.docx" 
              />
              <UploadCloud size={40} className="mx-auto text-slate-400 shrink-0 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Click to browse files</h4>
              <p className="text-xs text-slate-400">PDF and DOCX formats (Up to 10MB)</p>
            </div>

            {uploading && (
              <div className="mt-4 flex items-center justify-center gap-2.5 text-xs text-slate-500 font-medium animate-pulse">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Gemini is parsing and matching resumes...</span>
              </div>
            )}
          </div>

          {/* Results Summary Box */}
          {uploadResults && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 max-h-56 overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload Results</h4>
              {uploadResults.map((res, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/40">
                  <div className="truncate max-w-[65%]">
                    <p className="font-semibold truncate">{res.filename}</p>
                    {res.success ? (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold capitalize">{res.fitCategory || 'Scored'}</p>
                    ) : (
                      <p className="text-[10px] text-rose-500 truncate">{res.error}</p>
                    )}
                  </div>
                  {res.success && res.score !== null && (
                    <span className="font-extrabold text-sm px-2 py-0.5 bg-brand-500 text-white rounded-md shrink-0">
                      {res.score}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Applications Ranked List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold">Applied Candidates</h3>
            <p className="text-xs text-slate-400 mt-1">Ranked by overall match score compatibility</p>
          </div>
          <span className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl flex items-center gap-1.5">
            <Users size={14} />
            <span>{job.applications?.length || 0} Total applicants</span>
          </span>
        </div>

        {job.applications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText size={48} className="stroke-1 mb-2 text-slate-300" />
            <p className="text-sm">No applicants for this position yet.</p>
            <p className="text-xs text-slate-500 mt-1">Use the upload box on the right to add candidate profiles.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Application Status</th>
                  <th className="py-3.5 px-4">Compatibility Scores</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {job.applications.map((app: any, idx: number) => {
                  const score = app.score;
                  const fit = score?.fitCategory || 'Pending';
                  
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all">
                      {/* Rank Index */}
                      <td className="py-4 px-4 font-extrabold text-slate-400">
                        #{idx + 1}
                      </td>

                      {/* Name & Contact */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-950 dark:text-white">{app.candidate?.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{app.candidate?.email || 'No email'}</div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                          app.status === 'SHORTLISTED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100/50' :
                          app.status === 'REVIEW' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100/50' :
                          'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100/50'
                        }`}>
                          {app.status}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-4 px-4">
                        {score ? (
                          <div className="flex items-center gap-3">
                            {/* Final score pill */}
                            <span className={`text-sm font-black px-2 py-1 rounded-xl text-white ${
                              score.finalScore >= 90 ? 'bg-emerald-500' :
                              score.finalScore >= 75 ? 'bg-blue-500' :
                              score.finalScore >= 50 ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`}>
                              {score.finalScore}%
                            </span>

                            {/* Fit Category description */}
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                              {fit}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => triggerManualEvaluation(app.candidateId)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:text-brand-600 bg-brand-50 dark:bg-brand-950/20 border border-brand-100/30 px-2.5 py-1.5 rounded-xl transition"
                          >
                            <Play size={10} />
                            <span>Evaluate AI Match</span>
                          </button>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <Link 
                          href={`/candidates/${app.candidateId}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <span>Profile details</span>
                          <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
