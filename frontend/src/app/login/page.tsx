'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi } from '../../utils/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if redirect contains expired message
    if (searchParams.get('expired')) {
      setInfo('Your session has expired. Please sign in again.');
    }
    // If user is already logged in, redirect to dashboard
    if (localStorage.getItem('smarthire_token')) {
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('smarthire_token', response.token);
      localStorage.setItem('smarthire_user', JSON.stringify(response.user));
      router.replace('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const useDemoCredentials = () => {
    setEmail('recruiter@smarthire.ai');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-brand-600 to-accent-400 rounded-2xl text-white shadow-lg shadow-brand-500/20 mb-3">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">SmartHire AI</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Enterprise AI Resume Parsing & Scoring Engine</p>
        </div>

        {/* Card Body */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-100 dark:shadow-none">
          
          <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Sign In</h3>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 rounded-xl">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/20 border border-brand-100/50 dark:border-brand-900/30 rounded-xl">
              <AlertCircle size={18} className="shrink-0" />
              <span>{info}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                placeholder="recruiter@smarthire.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Use Register page or seeded credentials database reset.") }} className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Seeder Filler Demo */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={useDemoCredentials}
              className="w-full py-2.5 px-4 text-xs font-semibold bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 transition-all"
            >
              Autofill Seeder Demo Credentials
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              New to SmartHire?{' '}
              <Link href="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </React.Suspense>
  );
}
