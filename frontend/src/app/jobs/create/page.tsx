'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/DashboardLayout';
import { Briefcase, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { jobApi } from '../../../utils/api';

export default function JobCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [educationRequirements, setEducationRequirements] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !employmentType || !requiredSkills || !experienceYears || !educationRequirements) {
      setError('Please fill in all required fields (marked with *)');
      return;
    }

    setLoading(true);
    try {
      await jobApi.create({
        title,
        description,
        department,
        location,
        employmentType,
        requiredSkills,
        experienceYears: parseInt(experienceYears, 10),
        educationRequirements
      });
      router.push('/jobs');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create job campaign. Check server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      
      {/* Back link and title */}
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition mb-3"
        >
          <ArrowLeft size={14} />
          <span>Back to Campaigns</span>
        </button>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Create Job Campaign</h2>
        <p className="text-xs text-slate-400 mt-1">Design requirements to match candidates against</p>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Creation Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Job Title *
              </label>
              <input
                id="title"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                placeholder="Senior Full Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Department
              </label>
              <input
                id="department"
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                placeholder="Engineering / Sales / HR"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            {/* Employment Type */}
            <div>
              <label htmlFor="employmentType" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Employment Type *
              </label>
              <select
                id="employmentType"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none dark:bg-slate-900"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                placeholder="San Francisco, CA / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Required Experience Years */}
            <div>
              <label htmlFor="experienceYears" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Min Required Experience (Years) *
              </label>
              <input
                id="experienceYears"
                type="number"
                min="0"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                placeholder="3"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
            </div>

            {/* Education Requirement */}
            <div>
              <label htmlFor="educationRequirements" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Education Requirement *
              </label>
              <input
                id="educationRequirements"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                placeholder="B.S. in Computer Science or equivalent experience"
                value={educationRequirements}
                onChange={(e) => setEducationRequirements(e.target.value)}
              />
            </div>

          </div>

          {/* Required Skills Comma Separated */}
          <div>
            <label htmlFor="requiredSkills" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Required Tech Skills (comma separated) *
            </label>
            <input
              id="requiredSkills"
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
              placeholder="React, Node.js, TypeScript, PostgreSQL, Docker"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
            />
            <p className="text-[10px] text-slate-400 mt-1.5">Input skills separated by commas. These will be parsed to check overlap percentage in resume match scores.</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Job Description *
            </label>
            <textarea
              id="description"
              required
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none resize-y"
              placeholder="We are looking for a software developer to build..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all duration-150 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={18} />
                  <span>Create Campaign</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </DashboardLayout>
  );
}
