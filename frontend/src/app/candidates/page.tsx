'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users, 
  Search, 
  UploadCloud, 
  Trash2, 
  ExternalLink, 
  Mail, 
  Phone,
  MapPin,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { candidateApi, resumeApi } from '../../utils/api';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCandidates = async () => {
    try {
      const response = await candidateApi.getAll();
      setCandidates(response.candidates);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch candidates from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete candidate "${name}"? This will permanently delete their profile and all active job applications/scores.`)) {
      return;
    }

    try {
      await candidateApi.delete(id);
      setCandidates(candidates.filter(c => c.id !== id));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete candidate: ' + err.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadResults(null);
    setError('');

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('resumes', files[i]);
    }

    try {
      const response = await resumeApi.upload(formData);
      setUploadResults(response.results);
      // Reload candidate pool
      await fetchCandidates();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error uploading resumes.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filter candidates based on name or skills matching searchQuery
  const filteredCandidates = candidates.filter(c => {
    const nameMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const skillMatch = c.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return nameMatch || skillMatch;
  });

  return (
    <DashboardLayout>
      
      {/* Header action panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Talent Database</h2>
          <p className="text-xs text-slate-400 mt-1">Review parsed candidate profiles and match scores</p>
        </div>

        {/* Global batch uploader */}
        <div className="flex gap-3">
          <input 
            type="file" 
            multiple
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.docx" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition duration-150 disabled:opacity-50"
          >
            <UploadCloud size={18} />
            <span>{uploading ? 'Parsing...' : 'Batch Upload Resumes'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl">
          {error}
        </div>
      )}

      {/* Upload Results banner */}
      {uploadResults && (
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Batch Import Status</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {uploadResults.map((r, i) => (
              <div key={i} className="text-xs p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                <span className="truncate font-semibold max-w-[80%]">{r.filename}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                  r.success ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/20'
                }`}>
                  {r.success ? 'Imported' : 'Error'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
          placeholder="Search by candidate name or key tech skills (e.g. React, PostgreSQL)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400">
          <Users size={56} className="stroke-1 mb-4 text-slate-300 dark:text-slate-700" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Candidates Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm text-center">Either upload resumes or adjust your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCandidates.map((c) => (
            <div 
              key={c.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white line-clamp-1">{c.name}</h3>
                  <button 
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition"
                    title="Delete Candidate"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Subinfo details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2 truncate">
                    <Mail size={14} className="shrink-0 text-slate-400" />
                    <span>{c.email || 'No email registered'}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Phone size={14} className="shrink-0 text-slate-400" />
                    <span>{c.phone || 'No phone number'}</span>
                  </div>
                  {c.location && (
                    <div className="flex items-center gap-2 truncate sm:col-span-2">
                      <MapPin size={14} className="shrink-0 text-slate-400" />
                      <span>{c.location}</span>
                    </div>
                  )}
                </div>

                {/* Skills tags block */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {c.skills.slice(0, 5).map((s: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="text-xs px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-lg border border-slate-100 dark:border-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                  {c.skills.length > 5 && (
                    <span className="text-xs text-slate-400 font-semibold self-center">+{c.skills.length - 5} more</span>
                  )}
                </div>
              </div>

              {/* Candidate Bottom Summary / Application status */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center mt-auto">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Briefcase size={14} className="text-slate-400" />
                  <span>{c.applications?.length || 0} applied campaigns</span>
                </div>
                
                <Link 
                  href={`/candidates/${c.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <span>Review Profile</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}
