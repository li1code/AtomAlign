"use client";

import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'next/navigation';
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

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'L' : 'D'} p-6 md:p-10 transition-all duration-300 font-sans`}>
      <div className="max-w-3xl mx-auto space-y-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Account Settings</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Manage your preferences, security, and application behavior.</p>
          </div>

          <div className="p-6 md:p-8 space-y-10">
            {/* Appearance Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
                <Monitor size={20} className="text-yellow-500" /> Appearance
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Customize how AtomAlign looks on your device.</p>
              
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white text-sm">Application Theme</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Currently using {theme} mode</div>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                </button>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
                <Bell size={20} className="text-yellow-500" /> Notification Preferences
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Choose what updates you want to receive.</p>
              
              <div className="space-y-2">
                <label className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer">
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-white text-sm">Email Notifications</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Receive goal approval updates via email</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.email} 
                    onChange={() => setNotifications({...notifications, email: !notifications.email})}
                    className="w-5 h-5 rounded border-zinc-300 text-yellow-500 focus:ring-yellow-500" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer">
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-white text-sm">System Updates</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Get notified about quarterly reviews and sweeps</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.updates} 
                    onChange={() => setNotifications({...notifications, updates: !notifications.updates})}
                    className="w-5 h-5 rounded border-zinc-300 text-yellow-500 focus:ring-yellow-500" 
                  />
                </label>
              </div>
            </section>

            {/* Security Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
                <Shield size={20} className="text-yellow-500" /> Security
              </div>
              
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white text-sm">Change Password</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Update your account password securely</div>
                </div>
                <button className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                  <Key size={16} /> Update
                </button>
              </div>
              
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-red-700 dark:text-red-400 text-sm">Active Sessions</div>
                  <div className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">Sign out of all other devices</div>
                </div>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                  <Smartphone size={16} /> Revoke Sessions
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
