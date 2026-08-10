'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  User, 
  Shield, 
  Layers, 
  HelpCircle,
  AlertCircle,
  Save, 
  CheckCircle
} from 'lucide-react';
import { authApi } from '../../utils/api';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  
  const [geminiKey, setGeminiKey] = useState(''); // Developer override
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('smarthire_user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setName(u.name);
      setEmail(u.email);
      setRole(u.role);
    }
    
    // Load developer API key override if present
    const savedKey = localStorage.getItem('smarthire_gemini_key') || '';
    setGeminiKey(savedKey);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!name || !email) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Simulate profile update in localStorage
      const storedUser = localStorage.getItem('smarthire_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        u.name = name;
        u.email = email;
        localStorage.setItem('smarthire_user', JSON.stringify(u));
      }
      
      // Save Gemini key override
      if (geminiKey) {
        localStorage.setItem('smarthire_gemini_key', geminiKey);
      } else {
        localStorage.removeItem('smarthire_gemini_key');
      }

      setSuccess('Profile and settings updated successfully.');
      setLoading(false);
    }, 800);
  };

  return (
    <DashboardLayout>
      
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure recruiter profiles and matching parameters</p>
      </div>

      {success && (
        <div className="p-4 mb-6 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-2xl flex items-center gap-2">
          <CheckCircle size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Settings form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User size={20} className="text-brand-500" />
            <span>Recruiter Profile</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Session Role
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800 text-sm font-semibold capitalize text-slate-650">
                <Shield size={16} className="text-slate-450 shrink-0" />
                <span>{role.toLowerCase()} level access permissions</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">AI Provider Credentials</h4>
              <p className="text-xs text-slate-400 mb-4">You can set your Gemini API key inside `backend/.env`. Alternatively, paste a developer key override below to override for testing.</p>
              
              <label htmlFor="geminiKey" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                GEMINI_API_KEY override
              </label>
              <input
                id="geminiKey"
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none font-mono"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/10 transition duration-150 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ATS Constants Info column */}
        <div className="space-y-6">
          
          {/* Match criteria weights */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-md font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Layers size={18} className="text-brand-500" />
              <span>Matching Matrix</span>
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              SmartHire uses a weighted scoring formula to calculate candidate-to-job compatibility. These weights are fixed according to standard ATS criteria:
            </p>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
                <span className="text-slate-500 dark:text-slate-400">Skill Match Weight</span>
                <span className="text-brand-600 dark:text-brand-400">40%</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
                <span className="text-slate-500 dark:text-slate-400">Experience Weight</span>
                <span className="text-brand-600 dark:text-brand-400">30%</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
                <span className="text-slate-500 dark:text-slate-400">Education Weight</span>
                <span className="text-brand-600 dark:text-brand-400">20%</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
                <span className="text-slate-500 dark:text-slate-400">Certification Weight</span>
                <span className="text-brand-600 dark:text-brand-400">10%</span>
              </div>
            </div>
          </div>

          {/* Help card */}
          <div className="bg-gradient-to-tr from-brand-600 to-accent-600 text-white rounded-3xl p-6 shadow-md">
            <HelpCircle size={24} className="mb-3 shrink-0" />
            <h4 className="text-md font-bold mb-2">Need Assistance?</h4>
            <p className="text-xs leading-relaxed opacity-90 mb-4">
              Refer to the system documentation for details about docker databases deployment, environment setups, and parsing algorithms.
            </p>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert("Refer to README.md in the project root directory."); }}
              className="inline-block px-4 py-2 bg-white text-brand-700 text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition"
            >
              System Guide
            </a>
          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}
