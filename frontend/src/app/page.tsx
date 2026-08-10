'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EntryPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('smarthire_token');
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
