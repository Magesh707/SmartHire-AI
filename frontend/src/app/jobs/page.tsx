'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  PlusCircle, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { jobApi } from '../../utils/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const response = await jobApi.getAll();
      setJobs(response.jobs);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load jobs listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the job campaign for "${title}"? This will delete all candidate applications associated with it.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await jobApi.delete(id);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete job.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      
      {/* Upper header action row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Active Campaigns</h2>
          <p className="text-xs text-slate-400 mt-1">Manage and track company job positions</p>
        </div>
        
        <Link
          href="/jobs/create"
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all duration-150"
        >
          <PlusCircle size={18} />
          <span>Create New Job</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
          <Briefcase size={56} className="stroke-1 mb-4 text-slate-300 dark:text-slate-700" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Job Openings</h3>
          <p className="text-sm text-slate-400 mt-1.5 max-w-sm text-center">Get started by creating your first job opening to map candidate resumes against.</p>
          <Link
            href="/jobs/create"
            className="mt-6 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition"
          >
            Create Job Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div>
                {/* Header status */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    job.status === 'OPEN' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/30' 
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {job.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 capitalize">{job.department || 'General'}</span>
                </div>

                <Link href={`/jobs/${job.id}`}>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white hover:text-brand-500 hover:underline line-clamp-1 transition-all">
                    {job.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {job.description}
                </p>

                {/* Info Pills */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin size={14} className="shrink-0 text-slate-400" />
                    <span className="truncate">{job.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Clock size={14} className="shrink-0 text-slate-400" />
                    <span>{job.employmentType} • Min {job.experienceYears} Years Exp</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center mt-auto">
                <Link 
                  href={`/jobs/${job.id}`} 
                  className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <Users size={16} />
                  <span>{job._count?.applications || 0} Candidates</span>
                  <ChevronRight size={14} />
                </Link>

                <button
                  onClick={() => handleDelete(job.id, job.title)}
                  disabled={deletingId === job.id}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition duration-150 disabled:opacity-50"
                  title="Delete Campaign"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}
