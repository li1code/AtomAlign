"use client";

import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Briefcase, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'L' : 'D'} p-6 md:p-10 transition-all duration-300 font-sans`}>
      <div className="max-w-3xl mx-auto space-y-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-yellow-500 text-zinc-950 font-bold rounded-full flex items-center justify-center text-4xl shadow-md">
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{user?.name}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm mt-1">{user?.email}</p>
              <div className="mt-3 flex gap-2">
                <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs font-bold font-mono tracking-widest uppercase rounded border border-yellow-500/20">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6 border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2 font-medium text-sm">
                  <User size={16} /> Full Name
                </div>
                <div className="text-zinc-900 dark:text-white font-semibold">{user?.name}</div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2 font-medium text-sm">
                  <Mail size={16} /> Email Address
                </div>
                <div className="text-zinc-900 dark:text-white font-semibold font-mono text-sm">{user?.email}</div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2 font-medium text-sm">
                  <Briefcase size={16} /> Department
                </div>
                <div className="text-zinc-900 dark:text-white font-semibold">{user?.department || 'Not Assigned'}</div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2 font-medium text-sm">
                  <Shield size={16} /> System Access
                </div>
                <div className="text-zinc-900 dark:text-white font-semibold capitalize">{user?.role?.toLowerCase()} Level</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
