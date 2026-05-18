"use client";

import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Briefcase, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="w-full flex flex-col space-y-5 font-sans">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-medium text-[#888] dark:text-[#A8A8A0] hover:text-[#111] dark:hover:text-[#F5F5F5] transition-colors self-start"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-[#FFB800] text-[#0D0D0D] font-bold rounded-full flex items-center justify-center text-3xl font-syne">
            {user?.name?.slice(0, 2).toUpperCase() || 'US'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111] dark:text-[#F5F5F5] font-syne">{user?.name}</h1>
            <p className="text-[#888] dark:text-[#A8A8A0] font-mono text-sm mt-1">{user?.email}</p>
            <div className="mt-3 flex gap-2">
              <span className="role-pill role-admin">
                <span className="role-dot"></span>{user?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6 border-t border-[#E8E8E4] dark:border-white/[0.07] pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F7F7F5] dark:bg-[#141414] rounded-xl border border-[#E8E8E4] dark:border-white/[0.07]">
              <div className="flex items-center gap-2 text-[#888] dark:text-[#A8A8A0] mb-2 text-xs font-mono">
                <User size={14} /> FULL NAME
              </div>
              <div className="text-[#111] dark:text-[#F5F5F5] font-semibold text-sm">{user?.name}</div>
            </div>
            <div className="p-4 bg-[#F7F7F5] dark:bg-[#141414] rounded-xl border border-[#E8E8E4] dark:border-white/[0.07]">
              <div className="flex items-center gap-2 text-[#888] dark:text-[#A8A8A0] mb-2 text-xs font-mono">
                <Mail size={14} /> EMAIL ADDRESS
              </div>
              <div className="text-[#111] dark:text-[#F5F5F5] font-semibold font-mono text-sm">{user?.email}</div>
            </div>
            <div className="p-4 bg-[#F7F7F5] dark:bg-[#141414] rounded-xl border border-[#E8E8E4] dark:border-white/[0.07]">
              <div className="flex items-center gap-2 text-[#888] dark:text-[#A8A8A0] mb-2 text-xs font-mono">
                <Briefcase size={14} /> DEPARTMENT
              </div>
              <div className="text-[#111] dark:text-[#F5F5F5] font-semibold text-sm">{user?.department || 'Not Assigned'}</div>
            </div>
            <div className="p-4 bg-[#F7F7F5] dark:bg-[#141414] rounded-xl border border-[#E8E8E4] dark:border-white/[0.07]">
              <div className="flex items-center gap-2 text-[#888] dark:text-[#A8A8A0] mb-2 text-xs font-mono">
                <Shield size={14} /> SYSTEM ACCESS
              </div>
              <div className="text-[#111] dark:text-[#F5F5F5] font-semibold capitalize text-sm">{user?.role?.toLowerCase()} Level</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
