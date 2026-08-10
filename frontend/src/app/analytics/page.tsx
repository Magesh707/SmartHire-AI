'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  BarChart3, 
  Percent, 
  Sparkles,
  PieChart,
  Code2,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { analyticsApi } from '../../utils/api';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [appsPerJob, setAppsPerJob] = useState<any[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<any[]>([]);
  const [skillDistribution, setSkillDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await analyticsApi.getMetrics();
      setMetrics(response.metrics);
      setAppsPerJob(response.charts.applicationsPerJob);
      setStatusBreakdown(response.charts.statusBreakdown);
      setSkillDistribution(response.charts.skillDistribution);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Value helpers
  const maxApps = appsPerJob.length > 0 ? Math.max(...appsPerJob.map(a => a.applicationsCount), 1) : 1;
  const maxSkills = skillDistribution.length > 0 ? Math.max(...skillDistribution.map(s => s.count), 1) : 1;

  const totalApps = metrics?.totalApplications || 0;

  return (
    <DashboardLayout>
      
      {/* Header and Refresh button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Recruiting Telemetry</h2>
          <p className="text-xs text-slate-400 mt-1">Aggregate AI matching and application ratios</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw size={14} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl">
          {error}
        </div>
      )}

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shortlisting Ratio</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {totalApps > 0 ? Math.round(((metrics?.shortlistedCandidates || 0) / totalApps) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-450">of applicants approved</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">Percentage of candidates matching at or above 75% compatibility threshold.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rejection Rate</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-500 dark:text-rose-400">
              {totalApps > 0 ? Math.round(((metrics?.rejectedCandidates || 0) / totalApps) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-450">filtered out by match</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">Percentage of candidates with scores under 50% matching threshold.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hiring Velocity</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-brand-600 dark:text-brand-400">
              {metrics?.averageMatchScore || 0}%
            </span>
            <span className="text-xs text-slate-450">avg profile fit score</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">Mean ATS score computed across all parsed PDF/DOCX candidate submissions.</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Applications per job chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-brand-500" />
            <span>Applications Per Job Position</span>
          </h3>

          {appsPerJob.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
              No jobs or applications created yet.
            </div>
          ) : (
            <div className="space-y-5">
              {appsPerJob.map((job, idx) => {
                const ratio = job.applicationsCount / maxApps;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="truncate max-w-[80%]">{job.jobTitle}</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{job.applicationsCount} applicants</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-500 to-accent-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(ratio * 100, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skill distribution chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Code2 size={20} className="text-brand-500" />
            <span>Top Skills Distribution in Resume Pool</span>
          </h3>

          {skillDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
              No candidates parsed yet.
            </div>
          ) : (
            <div className="space-y-5">
              {skillDistribution.map((item, idx) => {
                const ratio = item.count / maxSkills;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item.skill}</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{item.count} resumes</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-accent-500 to-brand-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(ratio * 100, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Candidate Status Breakdown Donut/Pills */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <PieChart size={20} className="text-brand-500" />
          <span>Hiring Status Breakdown</span>
        </h3>

        {statusBreakdown.every(s => s.count === 0) ? (
          <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
            No active candidates.
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-8 justify-around">
            
            {/* Visual stacked bar */}
            <div className="w-full max-w-lg space-y-4">
              <div className="flex h-6 rounded-full overflow-hidden">
                {statusBreakdown.map((s, idx) => {
                  const percentage = totalApps > 0 ? (s.count / totalApps) * 100 : 0;
                  if (percentage === 0) return null;
                  
                  const colors = [
                    'bg-blue-500', // Applied
                    'bg-amber-500', // Review
                    'bg-emerald-500', // Shortlisted
                    'bg-rose-500' // Rejected
                  ];

                  return (
                    <div 
                      key={idx} 
                      className={`${colors[idx]} h-full transition-all`} 
                      style={{ width: `${percentage}%` }}
                      title={`${s.status}: ${s.count} (${Math.round(percentage)}%)`}
                    />
                  );
                })}
              </div>

              {/* Legend with percentages */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {statusBreakdown.map((s, idx) => {
                  const percentage = totalApps > 0 ? Math.round((s.count / totalApps) * 100) : 0;
                  const borderColors = [
                    'border-blue-500 text-blue-600 dark:text-blue-400',
                    'border-amber-500 text-amber-600 dark:text-amber-400',
                    'border-emerald-500 text-emerald-600 dark:text-emerald-400',
                    'border-rose-500 text-rose-600 dark:text-rose-400'
                  ];
                  return (
                    <div key={idx} className={`p-3 rounded-2xl border-l-4 border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 ${borderColors[idx]}`}>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.status}</div>
                      <div className="text-lg font-black mt-0.5 text-slate-800 dark:text-white">{s.count}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">{percentage}% ratio</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
