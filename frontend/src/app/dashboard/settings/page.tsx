"use client";

import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'next/navigation';
import api from '../../../services/api';
import { ArrowLeft, Bell, Shield, Key, Moon, Sun, Monitor, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
    marketing: false
  });

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('All password fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setSuccessMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordOpen(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass = "w-full bg-white dark:bg-[#0D0D0D] border border-[#D4D4D8] dark:border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2.5 text-xs text-[#111] dark:text-[#F5F5F5] focus:outline-none focus:border-[#FFB800] transition-colors placeholder:text-[#BBB] dark:placeholder:text-[rgba(168,168,160,0.4)]";

  return (
    <div className="w-full flex flex-col space-y-5 font-sans">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-medium text-[#888] dark:text-[#A8A8A0] hover:text-[#111] dark:hover:text-[#F5F5F5] transition-colors self-start"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[#E8E8E4] dark:border-white/[0.07] bg-[#F7F7F5] dark:bg-[#141414]">
          <h1 className="text-xl font-bold text-[#111] dark:text-[#F5F5F5] font-syne">Account Settings</h1>
          <p className="text-[#888] dark:text-[#A8A8A0] text-xs mt-1">Manage your preferences, security, and application behavior.</p>
        </div>

        <div className="p-6 md:p-8 space-y-10">
          {/* Notifications */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111] dark:text-[#F5F5F5] font-syne">
              <Bell size={16} className="text-[#FFB800]" /> Notification Preferences
            </div>
            <p className="text-[11px] text-[#888] dark:text-[#A8A8A0]">Choose what updates you want to receive.</p>
            
            <div className="space-y-2">
              <label className="flex items-center justify-between p-4 bg-[#F7F7F5] dark:bg-[#141414] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl cursor-pointer">
                <div>
                  <div className="font-semibold text-[#111] dark:text-[#F5F5F5] text-xs">Email Notifications</div>
                  <div className="text-[10px] text-[#888] dark:text-[#A8A8A0] mt-0.5">Receive goal approval updates via email</div>
                </div>
                <input 
                  type="checkbox" checked={notifications.email} 
                  onChange={() => setNotifications({...notifications, email: !notifications.email})}
                  className="w-4 h-4 rounded accent-[#FFB800]" 
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-[#F7F7F5] dark:bg-[#141414] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl cursor-pointer">
                <div>
                  <div className="font-semibold text-[#111] dark:text-[#F5F5F5] text-xs">System Updates</div>
                  <div className="text-[10px] text-[#888] dark:text-[#A8A8A0] mt-0.5">Get notified about quarterly reviews and sweeps</div>
                </div>
                <input 
                  type="checkbox" checked={notifications.updates} 
                  onChange={() => setNotifications({...notifications, updates: !notifications.updates})}
                  className="w-4 h-4 rounded accent-[#FFB800]" 
                />
              </label>
            </div>
          </section>

          {/* Security */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111] dark:text-[#F5F5F5] font-syne">
              <Shield size={16} className="text-[#FFB800]" /> Security
            </div>
            
            <div className="border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl overflow-hidden">
              <div className="p-4 bg-[#F7F7F5] dark:bg-[#141414] border-b border-[#E8E8E4] dark:border-white/[0.07] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#111] dark:text-[#F5F5F5] text-xs">Change Password</div>
                  <div className="text-[10px] text-[#888] dark:text-[#A8A8A0] mt-0.5">Update your account password securely</div>
                </div>
                <button 
                  onClick={() => setPasswordOpen(!passwordOpen)}
                  className="px-4 py-2 border border-[#D4D4D8] dark:border-[rgba(255,255,255,0.1)] hover:bg-[#F0EFEB] dark:hover:bg-[rgba(255,255,255,0.04)] text-[#111] dark:text-[#F5F5F5] rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  <Key size={14} /> {passwordOpen ? 'Cancel' : 'Update'}
                </button>
              </div>

              {passwordOpen && (
                <form onSubmit={handlePasswordChangeSubmit} className="p-4 space-y-4 bg-white dark:bg-[#1A1A1A]">
                  {errorMessage && (
                    <div className="p-2.5 bg-[#FCEBEB] dark:bg-[rgba(226,75,74,0.1)] border border-[#F09595] dark:border-[rgba(226,75,74,0.25)] text-[#A32D2D] dark:text-[#E24B4A] rounded-lg text-xs">
                      {errorMessage}
                    </div>
                  )}
                  {successMessage && (
                    <div className="p-2.5 bg-[#EAF3DE] dark:bg-[rgba(61,191,122,0.1)] border border-[#97C459] dark:border-[rgba(61,191,122,0.25)] text-[#3B6D11] dark:text-[#3DBF7A] rounded-lg text-xs">
                      {successMessage}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] uppercase tracking-wider mb-1.5 font-mono">Current Password</label>
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] uppercase tracking-wider mb-1.5 font-mono">New Password</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] uppercase tracking-wider mb-1.5 font-mono">Confirm New Password</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                    </div>
                  </div>

                  <button type="submit" disabled={savingPassword}
                    className="px-4 py-2.5 bg-[#FFB800] hover:bg-[#E5A600] text-[#0D0D0D] font-semibold rounded-lg text-xs transition-colors border-none disabled:opacity-50"
                  >
                    {savingPassword ? 'Saving...' : 'Save Password Change'}
                  </button>
                </form>
              )}
            </div>
            
            <div className="p-4 bg-[#FCEBEB] dark:bg-[rgba(226,75,74,0.08)] border border-[#F09595] dark:border-[rgba(226,75,74,0.2)] rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#A32D2D] dark:text-[#E24B4A] text-xs">Active Sessions</div>
                <div className="text-[10px] text-[#A32D2D]/70 dark:text-[#E24B4A]/70 mt-0.5">Sign out of all other devices</div>
              </div>
              <button className="px-4 py-2 bg-[#E24B4A] hover:bg-[#c03e3d] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 border-none">
                <Smartphone size={14} /> Revoke Sessions
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
