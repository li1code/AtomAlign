"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from 'next/navigation';
import { useGoalStore } from "../../../store/goalStore";
import GoalForm from "../../../components/goals/GoalForm";
import WeightageTracker from "../../../components/goals/WeightageTracker";
import QuarterlyUpdateForm from "../../../components/goals/QuarterlyUpdateForm";
import {
  Lock,
  BookOpen,
  Activity,
  CheckCircle,
} from "lucide-react";

export default function EmployeeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { goals, fetchGoals, isLoading, error } = useGoalStore();

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user, fetchGoals]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#888] dark:text-[#A8A8A0] gap-3">
        <div className="w-8 h-8 border-2 border-[#FFB800] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium tracking-wide font-mono">
          Syncing AtomAlign Dashboard...
        </p>
      </div>
    );
  }

  const hasSubmittedGoals = goals.some((g) => g.status !== "DRAFT");
  const activeCycle = "FY2026";
  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
  const approvedCount = goals.filter(g => g.status === 'APPROVED_LOCKED').length;
  const pendingCount = goals.filter(g => g.status === 'SUBMITTED').length;
  const sheetStatus = goals[0]?.status || 'DRAFT';

  return (
    <div className="w-full flex flex-col space-y-5">
      
      {/* Top metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-4">
          <span className="text-[9px] font-semibold text-[#888] dark:text-[#A8A8A0] uppercase tracking-wider block mb-1 font-mono">Total Weightage</span>
          <p className="text-2xl font-bold font-syne text-[#111] dark:text-[#F5F5F5]">{totalWeightage}% <span className="text-xs font-normal text-[#888] dark:text-[#A8A8A0]">/ 100%</span></p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-4">
          <span className="text-[9px] font-semibold text-[#888] dark:text-[#A8A8A0] uppercase tracking-wider block mb-1 font-mono">Approved Goals</span>
          <p className="text-2xl font-bold font-syne text-[#111] dark:text-[#F5F5F5]">{approvedCount} <span className="text-xs font-normal text-[#888] dark:text-[#A8A8A0] font-sans">Approved</span></p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-4">
          <span className="text-[9px] font-semibold text-[#888] dark:text-[#A8A8A0] uppercase tracking-wider block mb-1 font-mono">Pending Review</span>
          <p className="text-2xl font-bold font-syne text-[#111] dark:text-[#F5F5F5]">{pendingCount} <span className="text-xs font-normal text-[#888] dark:text-[#A8A8A0] font-sans">Pending</span></p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-4">
          <span className="text-[9px] font-semibold text-[#888] dark:text-[#A8A8A0] uppercase tracking-wider block mb-1 font-mono">Active Cycle & Status</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-[#111] dark:text-[#F5F5F5]">{activeCycle}</span>
            <span className="badge badge-submitted text-[9px]">
              {sheetStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FCEBEB] dark:bg-[rgba(226,75,74,0.1)] border border-[#F09595] dark:border-[rgba(226,75,74,0.25)] rounded-xl text-[#A32D2D] dark:text-[#E24B4A] text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {!hasSubmittedGoals ? (
            <GoalForm
              existingGoals={goals}
              onGoalsSaved={() => fetchGoals()}
            />
          ) : (
            <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-5 text-[#111] dark:text-[#F5F5F5] flex items-center gap-2 font-syne">
                <BookOpen size={16} className="text-[#FFB800]" /> Active Alignment Sheet
              </h2>

              <div className="space-y-3">
                {goals.map((goal) => {
                  const isLocked = goal.status === "APPROVED_LOCKED";
                  return (
                    <div
                      key={goal.id}
                      className="p-4 bg-[#F7F7F5] dark:bg-[#141414] rounded-xl border border-[#E8E8E4] dark:border-white/[0.07] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-[#111] dark:text-[#F5F5F5] text-[13px] font-syne">
                            {goal.title}
                          </h3>
                          <span className="text-[10px] text-[#888] dark:text-[#A8A8A0] font-mono">
                            Thrust Area: {goal.thrustArea}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLocked && <Lock size={12} className="text-[#888] dark:text-[#A8A8A0]" />}
                          <span className={`badge ${isLocked ? 'badge-locked' : 'badge-submitted'}`}>
                            {goal.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#555] dark:text-[#A8A8A0] mt-1 mb-3 leading-relaxed">
                        {goal.description}
                      </p>

                      <div className="grid grid-cols-3 gap-px bg-[#E8E8E4] dark:bg-white/[0.07] rounded-lg overflow-hidden text-[10px] font-mono">
                        <div className="bg-[#F7F7F5] dark:bg-[#141414] p-2.5">
                          <span className="block text-[#888] dark:text-[#A8A8A0] mb-0.5">UoM Metric</span>
                          <span className="font-semibold text-[#111] dark:text-[#F5F5F5]">{goal.uomType}</span>
                        </div>
                        <div className="bg-[#F7F7F5] dark:bg-[#141414] p-2.5">
                          <span className="block text-[#888] dark:text-[#A8A8A0] mb-0.5">Planned Target</span>
                          <span className="font-semibold text-[#111] dark:text-[#F5F5F5]">{goal.target}</span>
                        </div>
                        <div className="bg-[#F7F7F5] dark:bg-[#141414] p-2.5">
                          <span className="block text-[#888] dark:text-[#A8A8A0] mb-0.5">Weightage</span>
                          <span className="font-semibold text-[#FFB800]">{goal.weightage}%</span>
                        </div>
                      </div>

                      {isLocked && (
                        <div className="mt-3">
                          <QuarterlyUpdateForm goal={goal} onUpdate={() => fetchGoals()} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar area */}
        <div className="space-y-5">
          {!hasSubmittedGoals && <WeightageTracker goals={goals} />}

          {hasSubmittedGoals && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-5">
              <h3 className="font-semibold text-[10px] text-[#111] dark:text-[#F5F5F5] mb-4 flex items-center gap-2 uppercase tracking-wider font-mono">
                <Activity size={14} className="text-[#FFB800]" /> Goal Sheet Parameters
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#888] dark:text-[#A8A8A0]">Goal Count</span>
                  <span className="font-semibold text-[#111] dark:text-[#F5F5F5]">{goals.length} / 8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888] dark:text-[#A8A8A0]">Status</span>
                  <span className="badge badge-submitted text-[9px]">
                    {goals[0]?.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888] dark:text-[#A8A8A0]">Lock State</span>
                  <span className="font-semibold text-[#111] dark:text-[#F5F5F5]">
                    {goals.some((g) => g.isLocked) ? "Sheet Locked" : "Editing Allowed"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {hasSubmittedGoals && goals.some((g) => g.checkins && g.checkins.length > 0) && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-5">
              <h3 className="font-semibold text-[10px] text-[#111] dark:text-[#F5F5F5] mb-4 flex items-center gap-2 uppercase tracking-wider font-mono">
                <CheckCircle size={14} className="text-[#FFB800]" /> Manager Feedback Feed
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {goals.flatMap((g) => g.checkins || []).map((ch, idx) => (
                  <div key={idx} className="p-3 bg-[#F7F7F5] dark:bg-[#141414] rounded-lg border border-[#E8E8E4] dark:border-white/[0.07] text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#854F0B] dark:text-[#FFB800] font-mono">{ch.quarter}</span>
                      <span className="text-[#888] dark:text-[#A8A8A0] text-[10px]">L1 Check-in</span>
                    </div>
                    <p className="text-[#555] dark:text-[#A8A8A0]">"{ch.managerComment}"</p>
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
