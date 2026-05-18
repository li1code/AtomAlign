"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import ApprovalQueue from '../../../components/goals/ApprovalQueue';
import ManagerCheckin from '../../../components/goals/ManagerCheckin';
import api from '../../../services/api';
import { Award, MessageSquare, Clipboard } from 'lucide-react';

export default function ManagerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
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
    if (user) loadDashboardData();
  }, [user]);

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#A8A8A0] gap-4">
        <div className="w-10 h-10 border-2 border-[#FFB800] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono tracking-widest text-[#FFB800] uppercase">Syncing Manager Portal...</p>
      </div>
    );
  }

  const totalLockedGoals = teamGoals.filter(g => g.status === 'APPROVED_LOCKED');
  const totalCheckinsLogged = totalLockedGoals.reduce((sum, g) => sum + (g.checkins?.length || 0), 0);
  const expectedCheckins = totalLockedGoals.length * 4;
  const checkinCompletionPercentage = expectedCheckins > 0 ? Math.round((totalCheckinsLogged / expectedCheckins) * 100) : 0;

  return (
    <div className="w-full flex flex-col space-y-5 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#111] dark:text-[#F5F5F5] font-syne">Manager Portal</h1>
          <p className="text-xs text-[#888] dark:text-[#A8A8A0] mt-1">Team alignment, sheet reviews, and quarterly governance.</p>
        </div>
        <button onClick={loadDashboardData} disabled={fetching}
          className="flex items-center gap-2 px-4 py-2 bg-[#FFB800] hover:bg-[#E5A600] text-[#0D0D0D] font-semibold text-xs rounded-lg transition-colors border-none"
        >
          <Clipboard size={14} /> Refresh Data
        </button>
      </div>

      {/* Metrics */}
      <div className="metric-grid">
        <div className="metric-card neutral">
          <div className="metric-lbl">Queue Size</div>
          <div className="metric-val">{pendingGoals.length} Pending</div>
        </div>
        <div className="metric-card accent">
          <div className="metric-lbl">Locked Goal Cards</div>
          <div className="metric-val amber">{totalLockedGoals.length} Active</div>
        </div>
        <div className="metric-card neutral">
          <div className="metric-lbl">Check-in Completion</div>
          <div className="metric-val">{checkinCompletionPercentage}%</div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <ApprovalQueue pendingGoals={pendingGoals} onAction={loadDashboardData} />

          {/* Subordinate Goals */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-5">
            <div className="text-sm font-semibold text-[#111] dark:text-[#F5F5F5] mb-4 flex items-center gap-2 font-syne">
              Subordinate Goal Tracker
            </div>

            {totalLockedGoals.length === 0 ? (
              <p className="text-[#888] dark:text-[#A8A8A0] text-xs font-mono">No active locked employee sheets found for your team.</p>
            ) : (
              <div className="space-y-3">
                {totalLockedGoals.map(goal => (
                  <div key={goal.id} className="p-4 bg-[#F7F7F5] dark:bg-[#141414] rounded-xl border border-[#E8E8E4] dark:border-white/[0.07]">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="text-[13px] font-semibold text-[#111] dark:text-[#F5F5F5] font-syne">{goal.title}</div>
                        <span className="text-[10px] text-[#888] dark:text-[#A8A8A0] font-mono">
                          Owner: <span className="text-[#854F0B] dark:text-[#FFB800] font-semibold">{goal.employee?.name}</span> · Thrust: {goal.thrustArea}
                        </span>
                      </div>
                      <span className="badge badge-approved">Locked</span>
                    </div>

                    <p className="text-[11px] text-[#555] dark:text-[#A8A8A0] mt-2 leading-relaxed">{goal.description}</p>

                    <div className="grid grid-cols-3 gap-px bg-[#E8E8E4] dark:bg-white/[0.07] rounded-lg overflow-hidden font-mono text-[10px] mt-3">
                      <div className="bg-[#F7F7F5] dark:bg-[#141414] p-2.5">
                        <span className="block text-[#888] dark:text-[#A8A8A0] mb-0.5">UoM</span>
                        <span className="font-semibold text-[#111] dark:text-[#F5F5F5]">{goal.uomType}</span>
                      </div>
                      <div className="bg-[#F7F7F5] dark:bg-[#141414] p-2.5">
                        <span className="block text-[#888] dark:text-[#A8A8A0] mb-0.5">Target</span>
                        <span className="font-semibold text-[#111] dark:text-[#F5F5F5]">{goal.target}</span>
                      </div>
                      <div className="bg-[#F7F7F5] dark:bg-[#141414] p-2.5">
                        <span className="block text-[#888] dark:text-[#A8A8A0] mb-0.5">Weightage</span>
                        <span className="font-semibold text-[#FFB800]">{goal.weightage}%</span>
                      </div>
                    </div>

                    {goal.updates && goal.updates.length > 0 && (
                      <div className="bg-[#F7F7F5] dark:bg-[#0D0D0D] p-2.5 rounded-lg border border-[#E8E8E4] dark:border-white/[0.07] text-[10px] space-y-1.5 mt-3">
                        <span className="text-[#888] dark:text-[#A8A8A0] block font-semibold font-mono">Quarterly Progress Logs:</span>
                        {goal.updates.map((up: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-[#555] dark:text-[#A8A8A0] font-mono">
                            <span>Quarter: <strong className="text-[#111] dark:text-[#F5F5F5]">{up.quarter}</strong></span>
                            <span>Achievement: <strong className="text-[#111] dark:text-[#F5F5F5]">{up.actualAchievement}</strong></span>
                            <span className="text-[#3B6D11] dark:text-[#3DBF7A] font-semibold">{up.status}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <ManagerCheckin goalId={goal.id} onUpdate={loadDashboardData} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-5">
            <div className="text-sm font-semibold text-[#111] dark:text-[#F5F5F5] mb-3 flex items-center gap-1.5 font-syne">
              <Award size={14} className="text-[#FFB800]" /> Review Instructions
            </div>
            <p className="text-[11px] text-[#555] dark:text-[#A8A8A0] leading-relaxed mb-2">
              Review submitted employee sheets carefully. Use <strong className="text-[#111] dark:text-[#F5F5F5]">Edit Inline</strong> to adjust weightage or target properties before locking.
            </p>
            <p className="text-[11px] text-[#555] dark:text-[#A8A8A0] leading-relaxed">
              Log quarterly check-in feedback comments directly inside the active sheets to provide structured milestones.
            </p>
          </div>

          {totalLockedGoals.some(g => g.checkins && g.checkins.length > 0) && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-5">
              <div className="text-sm font-semibold text-[#111] dark:text-[#F5F5F5] mb-3 flex items-center gap-1.5 font-syne">
                <MessageSquare size={14} className="text-[#FFB800]" /> Recent Check-in Logs
              </div>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {totalLockedGoals.flatMap(g => (g.checkins || []).map((ch: any) => ({ ...ch, employeeName: g.employee?.name }))).map((ch, idx) => (
                  <div key={idx} className="p-3 bg-[#F7F7F5] dark:bg-[#141414] rounded-lg border border-[#E8E8E4] dark:border-white/[0.07] text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#111] dark:text-[#F5F5F5]">{ch.employeeName}</span>
                      <span className="text-[#854F0B] dark:text-[#FFB800] font-semibold font-mono">{ch.quarter}</span>
                    </div>
                    <p className="text-[#555] dark:text-[#A8A8A0] italic">"{ch.managerComment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
