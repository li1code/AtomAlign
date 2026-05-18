"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Sun, Moon, LogOut, User, Settings as SettingsIcon } from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-[#E8E8E4] dark:border-white/[0.07] bg-white dark:bg-[#111111] backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center">
        <h2 className="text-base font-semibold text-[#111] dark:text-[#F5F5F5] tracking-tight hidden sm:block font-syne">
          {user?.role === 'ADMIN' ? 'System Governance' : user?.role === 'MANAGER' ? 'Manager Portal' : 'My Goal Sheet'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {user?.role && (
          <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider font-mono
            bg-[#FEF4DC] dark:bg-[rgba(255,184,0,0.12)] text-[#854F0B] dark:text-[#FFB800] border border-[#FAC775] dark:border-[rgba(255,184,0,0.3)]">
            {user.role}
          </span>
        )}

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFB800] flex items-center justify-center text-xs font-bold text-[#0D0D0D]">
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl shadow-lg py-1 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8E8E4] dark:border-white/[0.07]">
                <p className="text-sm font-semibold text-[#111] dark:text-[#F5F5F5] truncate">{user?.name}</p>
                <p className="text-xs text-[#888] dark:text-[#A8A8A0] truncate mt-0.5 font-mono">{user?.email}</p>
              </div>
              <div className="py-1">
                <button onClick={() => { setProfileOpen(false); router.push('/dashboard/profile'); }} className="w-full text-left px-4 py-2 text-sm text-[#555] dark:text-[#A8A8A0] hover:bg-[#F4F4F0] dark:hover:bg-[rgba(255,255,255,0.04)] flex items-center gap-2 transition-colors">
                  <User size={16} /> Profile Details
                </button>
                <button onClick={() => { setProfileOpen(false); router.push('/dashboard/settings'); }} className="w-full text-left px-4 py-2 text-sm text-[#555] dark:text-[#A8A8A0] hover:bg-[#F4F4F0] dark:hover:bg-[rgba(255,255,255,0.04)] flex items-center gap-2 transition-colors">
                  <SettingsIcon size={16} /> Settings
                </button>
              </div>
              <div className="border-t border-[#E8E8E4] dark:border-white/[0.07] py-1">
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-[#E24B4A] hover:bg-[#FCEBEB] dark:hover:bg-[rgba(226,75,74,0.08)] flex items-center gap-2 transition-colors font-medium">
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
