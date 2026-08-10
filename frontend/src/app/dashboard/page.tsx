'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  XCircle, 
  Percent, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';
import { analyticsApi, candidateApi } from '../../utils/api';

interface DashboardMetrics {
  totalJobs: number;
  totalApplications: number;
  shortlistedCandidates: number;
  rejectedCandidates: number;
  averageMatchScore: number;
}

interface ApplicationPerJob {
  jobTitle: string;
  applicationsCount: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface SkillDistribution {
  skill: string;
  count: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [appsPerJob, setAppsPerJob] = useState<ApplicationPerJob[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [skillDistribution, setSkillDistribution] = useState<SkillDistribution[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsRes, candidateRes] = await Promise.all([
          analyticsApi.getMetrics(),
          candidateApi.getAll()
        ]);

        setMetrics(analyticsRes.metrics);
        setAppsPerJob(analyticsRes.charts.applicationsPerJob);
        setStatusBreakdown(analyticsRes.charts.statusBreakdown);
        setSkillDistribution(analyticsRes.charts.skillDistribution);
        
        // Take the top 5 most recent candidates
        setRecentCandidates(candidateRes.candidates.slice(0, 5));
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch dashboard metrics. Is the backend server running?');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Find max applications count for normalized bar sizing
  const maxApps = appsPerJob.length > 0 ? Math.max(...appsPerJob.map(a => a.applicationsCount), 1) : 1;
  const maxSkills = skillDistribution.length > 0 ? Math.max(...skillDistribution.map(s => s.count), 1) : 1;

  // Calculate colors for the status breakdown
  const statusColors: Record<string, string> = {
    'Applied': 'bg-blue-500 dark:bg-blue-600',
    'Review': 'bg-amber-500 dark:bg-amber-600',
    'Shortlisted': 'bg-emerald-500 dark:bg-emerald-600',
    'Rejected': 'bg-rose-500 dark:bg-rose-600'
  };

  return (
    <DashboardLayout>
      {error && (
        <div className="p-4 mb-6 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        
        {/* Total Jobs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Jobs</span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Briefcase size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight">{metrics?.totalJobs || 0}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <span>Active hiring campaigns</span>
          </p>
        </div>

        {/* Total Applications */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Applicants</span>
            <div className="p-2.5 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-2xl">
              <Users size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight">{metrics?.totalApplications || 0}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Clock size={12} className="text-brand-500" />
            <span>All resumes submitted</span>
          </p>
        </div>

        {/* Shortlisted */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Shortlisted</span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <CheckCircle size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">{metrics?.shortlistedCandidates || 0}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>Score ≥ 75 (High fit candidates)</span>
          </p>
        </div>

        {/* Rejected */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Rejected</span>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl">
              <XCircle size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">{metrics?.rejectedCandidates || 0}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>Filtered by AI Match</span>
          </p>
        </div>

        {/* Avg Match Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Avg Match Score</span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Percent size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">{metrics?.averageMatchScore || 0}%</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>Standard database average</span>
          </p>
        </div>

      </div>

      {/* Grid for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Applications Per Job */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span>Applications Per Job</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">Top campaigns</span>
          </h3>

          {appsPerJob.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-slate-400 text-sm">
              No jobs or applications created yet.
            </div>
          ) : (
            <div className="space-y-4">
              {appsPerJob.map((job, idx) => {
                const percentage = Math.round((job.applicationsCount / maxApps) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="truncate max-w-[80%]">{job.jobTitle}</span>
                      <span className="font-semibold">{job.applicationsCount} apps</span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skill Distribution & Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-6">Talent Status Breakdown</h3>
            
            {statusBreakdown.every(s => s.count === 0) ? (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                No active applications in database.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {statusBreakdown.map((s, idx) => {
                  const total = metrics?.totalApplications || 1;
                  const ratio = Math.round((s.count / total) * 100);
                  return (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl text-center">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{s.status}</div>
                      <div className="text-2xl font-black">{s.count}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1">{ratio}% ratio</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Top Tech Skills in Database</h4>
            {skillDistribution.length === 0 ? (
              <p className="text-xs text-slate-400">No candidate resumes parsed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {skillDistribution.slice(0, 6).map((item, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 text-xs font-bold border border-brand-100 dark:border-brand-900/30"
                  >
                    <span>{item.skill}</span>
                    <span className="px-1 py-0.2 bg-brand-200/50 dark:bg-brand-900 text-[10px] rounded-md text-brand-800 dark:text-brand-300">
                      {item.count}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Candidates Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold">Recent Applicants</h3>
            <p className="text-xs text-slate-400 mt-1">Review profiles recently parsed by Gemini AI</p>
          </div>
          <Link 
            href="/candidates" 
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
          >
            <span>View All Candidates</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Users size={40} className="stroke-1 mb-2" />
            <p className="text-sm">No candidate profiles registered in SmartHire.</p>
            <p className="text-xs text-slate-500 mt-1">Upload resumes in Candidate section to start parsing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Key Skills</th>
                  <th className="py-3.5 px-4">Active Applications</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {recentCandidates.map((candidate) => {
                  // Find highest app score
                  const highestApp = candidate.applications && candidate.applications.length > 0
                    ? candidate.applications.reduce((prev: any, current: any) => 
                        (prev.score?.finalScore || 0) > (current.score?.finalScore || 0) ? prev : current
                      )
                    : null;

                  return (
                    <tr key={candidate.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-950 dark:text-white">{candidate.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{candidate.email || 'No email'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {candidate.skills.slice(0, 4).map((s: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                              {s}
                            </span>
                          ))}
                          {candidate.skills.length > 4 && (
                            <span className="text-xs text-slate-400 font-medium">+{candidate.skills.length - 4} more</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {highestApp ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 bg-brand-50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 border border-brand-100/50 dark:border-brand-900/30 rounded-md truncate max-w-[160px]">
                              {highestApp.job?.title}
                            </span>
                            {highestApp.score && (
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                highestApp.score.finalScore >= 90 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                                highestApp.score.finalScore >= 75 ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400' :
                                highestApp.score.finalScore >= 50 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                                'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                              }`}>
                                {highestApp.score.finalScore}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Unassigned / No apps</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link 
                          href={`/candidates/${candidate.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:text-brand-600 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <span>Review</span>
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
