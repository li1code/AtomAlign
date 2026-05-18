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
  Award,
  Lock,
  BookOpen,
  Clock,
  Activity,
  CheckCircle,
  User,
} from "lucide-react";

export default function EmployeeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const { goals, fetchGoals, isLoading, error } = useGoalStore();
  const [selectedQuarter, setSelectedQuarter] = useState<
    "Q1" | "Q2" | "Q3" | "Q4"
  >("Q1");

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user, fetchGoals]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium tracking-wide">
          Syncing AtomAlign Dashboard...
        </p>
      </div>
    );
  }

  const hasSubmittedGoals = goals.some((g) => g.status !== "DRAFT");
  const activeCycle = "FY2026";

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'L' : 'D'} transition-all duration-300 font-sans p-6 md:p-10 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100`}>
      <div className="max-w-6xl mx-auto">
        {/* Sleek Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs font-semibold rounded border border-yellow-500/20">
                ACTIVE CYCLE: {activeCycle}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              My Goal Sheet
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Welcome back,{" "}
              <span className="text-zinc-900 dark:text-white font-medium">{user?.name}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="px-3 py-1 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-800 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
            >
              {theme === 'light' ? '☀ LIGHT' : '◐ DARK'}
            </button>

            <div className="flex gap-3 text-xs bg-zinc-100 dark:bg-zinc-900/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="block text-zinc-500">Department</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-300">
                  {user?.department || "N/A"}
                </span>
              </div>
              <div className="border-l border-zinc-200 dark:border-zinc-800 pl-3">
                <span className="block text-zinc-500">Role</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-300 capitalize">
                  {user?.role?.toLowerCase()}
                </span>
              </div>
            </div>

            <div className="relative">
               <button 
                 onClick={() => setProfileOpen(!profileOpen)} 
                 className="w-10 h-10 bg-yellow-500 hover:bg-yellow-400 transition-colors text-zinc-950 font-bold rounded-full flex items-center justify-center cursor-pointer shadow-sm border border-yellow-600/20"
               >
                 {user?.name?.slice(0, 2).toUpperCase() || 'EM'}
               </button>
               {profileOpen && (
                  <div className="absolute top-12 right-0 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 py-1">
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user?.name}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{user?.email}</div>
                    </div>
                    <button onClick={() => router.push('/dashboard/profile')} className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2"><User size={14}/> Profile Details</button>
                    <button onClick={() => router.push('/dashboard/settings')} className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2"><Award size={14}/> Settings</button>
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2">Log Out</button>
                  </div>
               )}
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard Space */}
          <div className="lg:col-span-2 space-y-6">
            {!hasSubmittedGoals ? (
              <GoalForm
                existingGoals={goals}
                onGoalsSaved={() => fetchGoals()}
              />
            ) : (
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 shadow-xl backdrop-blur-md">
                <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                  <BookOpen size={20} className="text-yellow-500" /> Active
                  Alignment Sheet
                </h2>

                <div className="space-y-4">
                  {goals.map((goal) => {
                    const isLocked = goal.status === "APPROVED_LOCKED";

                    return (
                      <div
                        key={goal.id}
                        className="p-5 bg-zinc-900/60 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-zinc-100 text-base">
                              {goal.title}
                            </h3>
                            <span className="text-xs text-zinc-500 font-medium">
                              Thrust Area: {goal.thrustArea}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isLocked && (
                              <Lock size={14} className="text-zinc-500" />
                            )}
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded border ${
                                isLocked
                                  ? "bg-green-500/10 border-green-500/20 text-green-500"
                                  : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                              }`}
                            >
                              {goal.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
                          {goal.description}
                        </p>

                        <div className="grid grid-cols-3 gap-2 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 text-xs text-zinc-400">
                          <div>
                            <span className="block text-zinc-600 font-medium mb-0.5">
                              UoM Metric
                            </span>
                            <span className="font-semibold text-zinc-300">
                              {goal.uomType}
                            </span>
                          </div>
                          <div className="border-l border-zinc-900 pl-3">
                            <span className="block text-zinc-600 font-medium mb-0.5">
                              Planned Target
                            </span>
                            <span className="font-semibold text-white">
                              {goal.target}
                            </span>
                          </div>
                          <div className="border-l border-zinc-900 pl-3">
                            <span className="block text-zinc-600 font-medium mb-0.5">
                              Weightage
                            </span>
                            <span className="font-semibold text-yellow-500">
                              {goal.weightage}%
                            </span>
                          </div>
                        </div>

                        {/* Interactive Quarterly Progress logging within the goal card */}
                        {isLocked && (
                          <div className="mt-4 border-t border-zinc-900 pt-4">
                            <QuarterlyUpdateForm
                              goal={goal}
                              onUpdate={() => fetchGoals()}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Contextual Sidebar Item: Weightage Tracker */}
            {!hasSubmittedGoals && <WeightageTracker goals={goals} />}

            {/* Contextual Sidebar Item: Status Overview / Progress Metrics */}
            {hasSubmittedGoals && (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-yellow-500" /> Goal Sheet
                  Parameters
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Goal Count</span>
                    <span className="font-medium text-white">
                      {goals.length} / 8
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Status</span>
                    <span className="font-medium text-yellow-500 uppercase tracking-wider text-[10px] bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                      {goals[0]?.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Lock State</span>
                    <span className="font-medium text-zinc-300">
                      {goals.some((g) => g.isLocked)
                        ? "Sheet Locked"
                        : "Editing Allowed"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Manager Comments / Checkins Feed */}
            {hasSubmittedGoals &&
              goals.some((g) => g.checkins && g.checkins.length > 0) && (
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 shadow-lg">
                  <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
                    <CheckCircle size={16} className="text-yellow-500" />{" "}
                    Manager Feedback Feed
                  </h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {goals
                      .flatMap((g) => g.checkins || [])
                      .map((ch, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-900 text-xs"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-yellow-500">
                              {ch.quarter}
                            </span>
                            <span className="text-zinc-600 font-medium">
                              L1 Check-in
                            </span>
                          </div>
                          <p className="text-zinc-400 italic">
                            "{ch.managerComment}"
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
