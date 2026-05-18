"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'next/navigation';
import ApprovalQueue from '../../../components/goals/ApprovalQueue';
import ManagerCheckin from '../../../components/goals/ManagerCheckin';
import api from '../../../services/api';
import { Users, Award, ShieldAlert, CheckCircle2, MessageSquare, Clipboard } from 'lucide-react';

export default function ManagerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingGoals, setPendingGoals] = useState<any[]>([]);
  const [teamGoals, setTeamGoals] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const loadDashboardData = async () => {
    try {
      setFetching(true);
      const [pendingRes, teamRes] = await Promise.all([
        api.get('/approvals/pending'),
        api.get('/approvals/team-goals')
      ]);
      setPendingGoals(pendingRes.data);
      setTeamGoals(teamRes.data);
    } catch (err) {
      console.error("Error loading manager data", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center text-zinc-400 gap-4">
        <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono tracking-widest text-[#FFB800] uppercase">Syncing Manager Portal...</p>
      </div>
    );
  }

  // Calculate team progress metrics
  const totalLockedGoals = teamGoals.filter(g => g.status === 'APPROVED_LOCKED');
  const totalCheckinsLogged = totalLockedGoals.reduce((sum, g) => sum + (g.checkins?.length || 0), 0);
  const expectedCheckins = totalLockedGoals.length * 4; // 4 quarters
  const checkinCompletionPercentage = expectedCheckins > 0 ? Math.round((totalCheckinsLogged / expectedCheckins) * 100) : 0;

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'L' : 'D'} p-4 md:p-6 transition-all duration-300`}>
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Full Dashboard Shell wrapper */}
        <div className="dash-shell">
          
          {/* Topbar */}
          <div className="dash-topbar">
            <div className="dash-brand">
              <div className="dash-logo">
                <div className="dash-logo-inner" />
              </div>
              <div className="dash-name">AtomAlign</div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggler widget */}
              <button 
                onClick={toggleTheme}
                className="mode-tab !w-auto !rounded-lg !px-3 !py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
              >
                {theme === 'light' ? '☀ LIGHT' : '◐ DARK'}
              </button>

              {/* Secure Governance role badge */}
              <span className="role-pill role-manager">
                <span className="role-dot" /> L1 MANAGER
              </span>

              {/* Profile drop-down options */}
              <div className="user-profile-menu">
                <div 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="user-profile-trigger"
                >
                  <div className="user-avatar">
                    {user?.name?.slice(0, 2).toUpperCase() || 'MG'}
                  </div>
                  <span className="text-xs font-semibold hidden md:inline-block font-sans">
                    {user?.name}
                  </span>
                  <i className="ti ti-chevron-down text-xs opacity-60" />
                </div>

                {profileOpen && (
                  <div className="user-dropdown">
                    <div className="user-info-section font-sans">
                      <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{user?.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{user?.email}</div>
                      <div className="text-[9px] uppercase tracking-wider text-[#185FA5] dark:text-[#5AA8F0] font-mono font-bold mt-1.5">{user?.department || 'Engineering'} Manager</div>
                    </div>
                    <button 
                      onClick={() => router.push('/dashboard/profile')}
                      className="dropdown-item"
                    >
                      <i className="ti ti-user nav-ico" /> Profile Details
                    </button>
                    <button 
                      onClick={() => router.push('/dashboard/settings')}
                      className="dropdown-item"
                    >
                      <i className="ti ti-settings nav-ico" /> Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="dropdown-item danger font-semibold"
                    >
                      <i className="ti ti-logout nav-ico" /> Log Out
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="dash-body">
            {/* Sidebar Controls */}
            <div className="dash-sidebar">
              <div className="nav-sec">Management</div>
              
              <button
                className="nav-item active"
              >
                <i className="ti ti-users nav-ico" /> Team Overview
              </button>

              <div className="nav-div" />
              
              <div className="nav-sec">Quick Info</div>
              <div className="px-3.5 py-2 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-900/60 text-[10px] leading-relaxed text-zinc-500 font-sans">
                Review subordinate sheets carefully before approving. Adjust targets dynamically as necessary.
              </div>
            </div>

            {/* Dashboard main panel content */}
            <div className="dash-content">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="dash-pg-title">Manager Portal</h1>
                  <p className="dash-pg-sub">Team alignment, sheet reviews, and quarterly governance.</p>
                </div>
                
                <button 
                  onClick={loadDashboardData}
                  className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer border-none"
                >
                  <i className="ti ti-refresh" /> Sync Database
                </button>
              </div>

              {/* Compact Metrics Grid */}
              <div className="metric-grid">
                <div className="metric-card neutral">
                  <div className="metric-lbl">Queue Size</div>
                  <div className="metric-val">{pendingGoals.length} Pending</div>
                  <i className="ti ti-clipboard metric-ico" />
                </div>
                
                <div className="metric-card accent">
                  <div className="metric-lbl">Locked Goal Cards</div>
                  <div className="metric-val amber">{totalLockedGoals.length} Active</div>
                  <i className="ti ti-lock metric-ico" />
                </div>
                
                <div className="metric-card neutral">
                  <div className="metric-lbl">Check-in Completion</div>
                  <div className="metric-val">{checkinCompletionPercentage}%</div>
                  <i className="ti ti-circle-check metric-ico" />
                </div>
              </div>

              {/* Two Column details panel */}
              <div className="two-col !grid-cols-1 lg:!grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  {/* 1. Pending Approvals Queue */}
                  <ApprovalQueue 
                    pendingGoals={pendingGoals} 
                    onAction={loadDashboardData} 
                  />

                  {/* 2. Subordinates Active Goals */}
                  <div className="block">
                    <div className="block-ttl flex items-center gap-2">
                      <i className="ti ti-users text-yellow-500" /> Subordinate Goal Tracker
                    </div>

                    {totalLockedGoals.length === 0 ? (
                      <p className="text-zinc-500 text-xs font-mono">No active locked employee sheets found for your team.</p>
                    ) : (
                      <div className="space-y-4">
                        {totalLockedGoals.map(goal => (
                          <div 
                            key={goal.id} 
                            className="goal-card font-sans"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="goal-ttl">{goal.title}</div>
                                <span className="goal-meta">
                                  Owner: <span className="text-yellow-600 dark:text-yellow-500 font-semibold">{goal.employee?.name}</span> · Thrust: {goal.thrustArea}
                                </span>
                              </div>
                              <span className="badge badge-approved">
                                Locked
                              </span>
                            </div>

                            <p className="goal-desc">{goal.description}</p>

                            <div className="grid grid-cols-3 gap-2 bg-zinc-50/50 dark:bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-900 font-mono text-[10px]">
                              <div>
                                <span className="block text-zinc-400 mb-0.5">UoM</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{goal.uomType}</span>
                              </div>
                              <div className="border-l border-zinc-200 dark:border-zinc-900 pl-3">
                                <span className="block text-zinc-400 mb-0.5">Target</span>
                                <span className="font-semibold text-zinc-800 dark:text-white">{goal.target}</span>
                              </div>
                              <div className="border-l border-zinc-200 dark:border-zinc-900 pl-3">
                                <span className="block text-zinc-400 mb-0.5">Weightage</span>
                                <span className="font-semibold text-yellow-600 dark:text-yellow-500">{goal.weightage}%</span>
                              </div>
                            </div>

                            {/* Completed Progress logs */}
                            {goal.updates && goal.updates.length > 0 && (
                              <div className="bg-zinc-50 dark:bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-900 text-[10px] space-y-1.5">
                                <span className="text-zinc-500 block font-semibold">Quarterly Progress Logs:</span>
                                {goal.updates.map((up: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center text-zinc-600 dark:text-zinc-300 font-mono">
                                    <span>Quarter: <strong>{up.quarter}</strong></span>
                                    <span>Achievement: <strong>{up.actualAchievement}</strong></span>
                                    <span className="text-green-600 dark:text-green-500">{up.status}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Log checkin review comment */}
                            <ManagerCheckin 
                              goalId={goal.id} 
                              onUpdate={loadDashboardData} 
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right hand panel instructions & history */}
                <div className="space-y-4">
                  {/* Instructions */}
                  <div className="block font-sans">
                    <div className="block-ttl flex items-center gap-1.5">
                      <Award size={16} className="text-yellow-500" /> Review Instructions
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-2.5">
                      Review submitted employee sheets carefully. Use <strong>Edit Inline</strong> to adjust weightage or target properties to meet team budget restrictions before locking.
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Log quarterly check-in feedback comments directly inside the active sheets to provide structured milestones.
                    </p>
                  </div>

                  {/* Recent check-ins */}
                  {totalLockedGoals.some(g => g.checkins && g.checkins.length > 0) && (
                    <div className="block">
                      <div className="block-ttl flex items-center gap-1.5">
                        <MessageSquare size={16} className="text-yellow-500" /> Recent Check-in Logs
                      </div>
                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 animate-fadeIn">
                        {totalLockedGoals.flatMap(g => (g.checkins || []).map((ch: any) => ({ ...ch, employeeName: g.employee?.name }))).map((ch, idx) => (
                          <div key={idx} className="p-3 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-lg border border-zinc-200 dark:border-zinc-900 text-xs">
                            <div className="flex justify-between items-center mb-1 font-sans">
                              <span className="font-semibold text-zinc-800 dark:text-white">{ch.employeeName}</span>
                              <span className="text-yellow-600 dark:text-yellow-500 font-semibold font-mono">{ch.quarter}</span>
                            </div>
                            <p className="text-zinc-500 dark:text-zinc-400 italic">"{ch.managerComment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="watermark">
            AtomAlign Design System · Pearl White & Midnight Black · {theme === 'light' ? 'Light Mode' : 'Dark Mode'} · Syne + DM Mono
          </div>
        </div>

      </div>
    </div>
  );
}
