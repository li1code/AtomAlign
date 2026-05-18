"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'next/navigation';
import api from '../../../services/api';
import { 
  Shield, Users, Award, AlertTriangle, Play, RefreshCw, 
  Search, Unlock, Lock, Download, CheckSquare, Plus,
  FileSpreadsheet, FileText, BarChart3, History, Layers
} from 'lucide-react';

interface Stats {
  totalEmployees: number;
  submissionRate: number;
  pendingApprovals: number;
  activeEscalations: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department?: { name: string };
}

interface Goal {
  id: string;
  title: string;
  description: string;
  thrustArea: string;
  target: number;
  weightage: number;
  status: string;
  isLocked: boolean;
  uomType: string;
  employee: {
    name: string;
    email: string;
    department?: { name: string };
  };
}

interface AuditLog {
  id: string;
  action: string;
  before: string | null;
  after: string | null;
  createdAt: string;
  user: {
    name: string;
    role: string;
  };
  goal: {
    title: string;
  } | null;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Dashboard states
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'governance' | 'kpis' | 'metrics' | 'audit'>('governance');
  
  // Filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Shared KPI state
  const [kpiForm, setKpiForm] = useState({
    title: '',
    description: '',
    thrustArea: '',
    target: 0,
    uomType: 'PERCENT_MIN',
    employeeIds: [] as string[],
    primaryEmployeeId: ''
  });

  // Unlock state
  const [unlockingGoalId, setUnlockingGoalId] = useState<string | null>(null);
  const [unlockReason, setUnlockReason] = useState('');

  // Loading & logs
  const [fetching, setFetching] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Analytics states
  const [deptStats, setDeptStats] = useState<any[]>([]);
  const [qoqStats, setQoqStats] = useState<any[]>([]);
  const [managerStats, setManagerStats] = useState<any[]>([]);

  const loadAllAdminData = async () => {
    try {
      setFetching(true);
      const [
        statsRes, 
        logsRes, 
        empRes, 
        goalRes, 
        escRes,
        deptRes,
        qoqRes,
        mgrRes
      ] = await Promise.all([
        api.get('/analytics/stats'),
        api.get('/analytics/audit-logs'),
        api.get('/admin/employees'),
        api.get('/admin/goals'),
        api.get('/admin/escalations'),
        api.get('/analytics/departments'),
        api.get('/analytics/qoq'),
        api.get('/analytics/managers')
      ]);

      setStats(statsRes.data);
      setLogs(logsRes.data);
      setEmployees(empRes.data);
      setAllGoals(goalRes.data);
      setEscalations(escRes.data);
      setDeptStats(deptRes.data);
      setQoqStats(qoqRes.data);
      setManagerStats(mgrRes.data);
    } catch (err) {
      console.error('Failed loading admin database payload', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadAllAdminData();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleRunSweep = async () => {
    setActionLoading(true);
    setFeedbackMsg('');
    try {
      const res = await api.post('/admin/escalations/run');
      setFeedbackMsg(`Sweep completed: Escalated ${res.data.escalatedCount} overdue sheet(s).`);
      loadAllAdminData();
    } catch (err) {
      setFeedbackMsg('Failed to trigger background sweep job.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlockGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockingGoalId || !unlockReason.trim()) return;
    setActionLoading(true);
    setFeedbackMsg('');
    try {
      await api.post(`/admin/goals/${unlockingGoalId}/unlock`, { reason: unlockReason });
      setFeedbackMsg('Goal sheet successfully unlocked and set to Draft.');
      setUnlockingGoalId(null);
      setUnlockReason('');
      loadAllAdminData();
    } catch (err) {
      setFeedbackMsg('Unlock failed. Please verify authorization.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDistributeKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kpiForm.employeeIds.length === 0) {
      alert('Please select at least one recipient employee.');
      return;
    }
    setActionLoading(true);
    setFeedbackMsg('');
    try {
      await api.post('/admin/shared-goals', kpiForm);
      setFeedbackMsg('Departmental shared KPI distributed to selected employees.');
      setKpiForm({
        title: '',
        description: '',
        thrustArea: '',
        target: 0,
        uomType: 'PERCENT_MIN',
        employeeIds: [],
        primaryEmployeeId: ''
      });
      loadAllAdminData();
    } catch (err) {
      setFeedbackMsg('Failed distributing shared KPI.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadReport = async (reportType: 'goals' | 'achievements') => {
    try {
      const response = await api.get(`/admin/reports/${reportType}/export`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_alignment_report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed downloading report. Please retry.');
    }
  };

  const handleCheckboxChange = (empId: string) => {
    setKpiForm(prev => {
      const ids = prev.employeeIds.includes(empId)
        ? prev.employeeIds.filter(id => id !== empId)
        : [...prev.employeeIds, empId];
      return { ...prev, employeeIds: ids };
    });
  };

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium tracking-wide">Syncing AtomAlign Governance...</p>
      </div>
    );
  }

  const filteredGoals = allGoals.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.employee?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <span className="role-pill role-admin">
                <span className="role-dot" /> Secure Governance
              </span>

              {/* Profile drop-down options */}
              <div className="user-profile-menu">
                <div 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="user-profile-trigger"
                >
                  <div className="user-avatar">
                    {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
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
                      <div className="text-[9px] uppercase tracking-wider text-yellow-600 dark:text-yellow-500 font-mono font-bold mt-1.5">System Admin</div>
                    </div>
                    <button 
                      onClick={() => setProfileOpen(false)}
                      className="dropdown-item"
                    >
                      <i className="ti ti-user nav-ico" /> Profile Details
                    </button>
                    <button 
                      onClick={() => setProfileOpen(false)}
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
              <div className="nav-sec">Governance</div>
              
              <button
                onClick={() => setActiveTab('governance')}
                className={`nav-item ${activeTab === 'governance' ? 'active' : ''}`}
              >
                <i className="ti ti-layout-dashboard nav-ico" /> Goal Governance
              </button>
              
              <button
                onClick={() => setActiveTab('kpis')}
                className={`nav-item ${activeTab === 'kpis' ? 'active' : ''}`}
              >
                <i className="ti ti-users nav-ico" /> Shared KPIs
              </button>

              <button
                onClick={() => setActiveTab('metrics')}
                className={`nav-item ${activeTab === 'metrics' ? 'active' : ''}`}
              >
                <i className="ti ti-chart-bar nav-ico" /> Heatmap
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
              >
                <i className="ti ti-history nav-ico" /> Audit Diffs
              </button>

              <div className="nav-div" />
              
              <div className="nav-sec">Actions</div>
              
              <button 
                onClick={handleRunSweep}
                disabled={actionLoading}
                className="action-btn primary"
              >
                <i className="ti ti-player-play nav-ico" /> Trigger Overdue Sweep
              </button>

              <button
                onClick={() => handleDownloadReport('goals')}
                className="action-btn"
              >
                <i className="ti ti-file-export nav-ico" /> Export Alignment
              </button>

              <button
                onClick={() => handleDownloadReport('achievements')}
                className="action-btn"
              >
                <i className="ti ti-report nav-ico" /> Progress Report
              </button>
            </div>

            {/* Dashboard main panel content */}
            <div className="dash-content">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="dash-pg-title">System Administration</h1>
                  <p className="dash-pg-sub">Organization-wide alignment, unlock rules, audit diffs, and escalations check.</p>
                </div>
                
                <button 
                  onClick={loadAllAdminData}
                  className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <i className="ti ti-refresh" /> Sync Database
                </button>
              </div>

              {feedbackMsg && (
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg text-yellow-600 dark:text-yellow-500 text-xs flex justify-between items-center font-medium">
                  <span>{feedbackMsg}</span>
                  <button onClick={() => setFeedbackMsg('')} className="text-zinc-500 hover:text-zinc-300 font-bold text-sm">&times;</button>
                </div>
              )}

              {/* Compact Metrics Grid */}
              {stats && (
                <div className="metric-grid">
                  <div className="metric-card neutral">
                    <div className="metric-lbl">Total Employees</div>
                    <div className="metric-val">{stats.totalEmployees}</div>
                    <i className="ti ti-users metric-ico" />
                  </div>
                  
                  <div className="metric-card accent">
                    <div className="metric-lbl">Goal Submission</div>
                    <div className="metric-val amber">{stats.submissionRate}%</div>
                    <i className="ti ti-target metric-ico" />
                  </div>
                  
                  <div className="metric-card danger">
                    <div className="metric-lbl">Pending Approvals</div>
                    <div className="metric-val danger">{stats.pendingApprovals}</div>
                    <i className="ti ti-alert-triangle metric-ico" />
                  </div>
                  
                  <div className="metric-card danger">
                    <div className="metric-lbl">Active Escalations</div>
                    <div className="metric-val danger">{stats.activeEscalations}</div>
                    <i className="ti ti-flame metric-ico" />
                  </div>
                </div>
              )}

              {/* Tab Content 1: Governance & Search */}
              {activeTab === 'governance' && (
                <div className="space-y-4">
                  {/* High Density Search panel */}
                  <div className="block">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                      <div className="block-ttl !mb-0">Organizational Goal Search</div>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 text-zinc-500" size={14} />
                        <input
                          type="text"
                          placeholder="Search employee or goal..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs focus:outline-none placeholder-zinc-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inline Unlock Confirm form */}
                  {unlockingGoalId && (
                    <div className="block !bg-yellow-500/5 border border-yellow-500/20">
                      <h4 className="font-bold text-sm text-yellow-500 mb-2 flex items-center gap-1.5">
                        <Unlock size={14} /> Unlock Sheet Confirmation
                      </h4>
                      <form onSubmit={handleUnlockGoal} className="space-y-3">
                        <p className="text-xs text-zinc-400">
                          Unlocking will return the employee's approved goal card to <strong className="text-yellow-500">Draft</strong> state. A governance reason is mandatory.
                        </p>
                        <input
                          type="text"
                          required
                          value={unlockReason}
                          onChange={e => setUnlockReason(e.target.value)}
                          placeholder="Key in the unlock reason (e.g. Subordinate adjustment request)"
                          className="w-full"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setUnlockingGoalId(null)}
                            className="px-3 py-1.5 bg-zinc-850 dark:bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-[#FFB800] hover:bg-[#E2A400] text-zinc-950 rounded text-xs font-semibold cursor-pointer border-none"
                          >
                            Confirm & Unlock
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* High Density Goal Cards Grid */}
                  <div className="goal-grid">
                    {filteredGoals.map(goal => (
                      <div key={goal.id} className="goal-card font-sans">
                        <div className="flex justify-between items-start gap-2">
                          <div className="goal-ttl">{goal.title}</div>
                          <span className={`badge ${
                            goal.isLocked ? 'badge-locked' : 'badge-draft'
                          }`}>
                            {goal.isLocked ? 'Locked' : 'Draft'}
                          </span>
                        </div>
                        <div className="goal-meta">
                          {goal.employee?.name} · {goal.employee?.department?.name || 'N/A'}
                        </div>
                        <div className="goal-desc line-clamp-2">
                          {goal.description}
                        </div>
                        <div className="prog-track">
                          <div 
                            className="prog-fill" 
                            style={{ 
                              width: `${goal.isLocked ? 100 : 0}%`,
                              background: goal.isLocked ? '#3DBF7A' : '#FFB800' 
                            }} 
                          />
                        </div>
                        <div className="goal-footer">
                          <span className="goal-wt">Weightage {goal.weightage}%</span>
                          {goal.isLocked && (
                            <button
                              onClick={() => setUnlockingGoalId(goal.id)}
                              className="unlock-btn flex items-center gap-1 cursor-pointer"
                            >
                              <Unlock size={10} /> Unlock Sheet
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Active Overdue Escalations Sweep Queue */}
                  <div className="block">
                    <div className="block-ttl flex items-center gap-1.5 text-red-500">
                      <AlertTriangle size={15} /> Active Escalation Queue
                    </div>
                    {escalations.length === 0 ? (
                      <p className="text-xs text-zinc-500 font-mono">No overdue approval escalations found.</p>
                    ) : (
                      <div className="space-y-2 font-sans">
                        {escalations.map(esc => (
                          <div key={esc.id} className="esc-card">
                            <div>
                              <div className="esc-name">{esc.user?.name}</div>
                              <div className="esc-desc">{esc.reason}</div>
                            </div>
                            <span className="badge badge-overdue">
                              Overdue
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Tab Content 2: Shared Department KPIs Console */}
              {activeTab === 'kpis' && (
                <div className="block">
                  <div className="block-ttl flex items-center gap-1.5">
                    <Layers size={16} className="text-yellow-500" /> Distribute Shared Departmental KPI
                  </div>
                  <form onSubmit={handleDistributeKpi} className="space-y-4 font-sans">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1.5">KPI Title</label>
                        <input
                          type="text"
                          required
                          value={kpiForm.title}
                          onChange={e => setKpiForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Sales Growth KPI"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Thrust Area</label>
                        <input
                          type="text"
                          required
                          value={kpiForm.thrustArea}
                          onChange={e => setKpiForm(prev => ({ ...prev, thrustArea: e.target.value }))}
                          placeholder="e.g. Business Strategy"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Description</label>
                      <textarea
                        required
                        value={kpiForm.description}
                        onChange={e => setKpiForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter detailed goals alignment instructions..."
                        className="w-full h-20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Metric Type (UoM)</label>
                        <select
                          value={kpiForm.uomType}
                          onChange={e => setKpiForm(prev => ({ ...prev, uomType: e.target.value }))}
                          className="w-full"
                        >
                          <option value="NUMERIC_MIN">Numeric (Higher is better)</option>
                          <option value="NUMERIC_MAX">Numeric (Lower is better)</option>
                          <option value="PERCENT_MIN">Percentage (Higher is better)</option>
                          <option value="PERCENT_MAX">Percentage (Lower is better)</option>
                          <option value="TIMELINE">Timeline (Date-based)</option>
                          <option value="ZERO_BASED">Zero-based (Incidents)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Target Value</label>
                        <input
                          type="number"
                          required
                          value={kpiForm.target || ''}
                          onChange={e => setKpiForm(prev => ({ ...prev, target: parseFloat(e.target.value) || 0 }))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Recipient Selection Grid */}
                    <div className="border-t border-zinc-200 dark:border-zinc-900 pt-4 mt-2">
                      <label className="block text-xs font-semibold text-zinc-500 mb-2">Select Recipient Employees</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/40 p-3 rounded-lg border border-zinc-200 dark:border-zinc-900">
                        {employees.map(emp => (
                          <label key={emp.id} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-white">
                            <input
                              type="checkbox"
                              checked={kpiForm.employeeIds.includes(emp.id)}
                              onChange={() => handleCheckboxChange(emp.id)}
                              className="rounded bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-750 text-yellow-500 focus:ring-yellow-500/50"
                            />
                            <span>{emp.name} ({emp.department?.name || 'N/A'})</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Designate Primary Driver / Owner (KPI updates propagate from them)</label>
                      <select
                        value={kpiForm.primaryEmployeeId}
                        onChange={e => setKpiForm(prev => ({ ...prev, primaryEmployeeId: e.target.value }))}
                        className="w-full"
                      >
                        <option value="">Select primary driver...</option>
                        {employees.filter(emp => kpiForm.employeeIds.includes(emp.id)).map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-3 bg-[#FFB800] hover:bg-[#E2A400] text-zinc-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer border-none"
                    >
                      Distribute Shared KPI Sheet
                    </button>
                  </form>
                </div>
              )}

              {/* Tab Content 3: Analytics Heatmap & Metrics */}
              {activeTab === 'metrics' && (
                <div className="space-y-4">
                  {/* Department Stats */}
                  <div className="block font-sans">
                    <div className="block-ttl">Department completion Statistics</div>
                    <div className="space-y-4">
                      {deptStats.map((dept, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs text-zinc-700 dark:text-zinc-300">
                            <span className="font-semibold">{dept.departmentName} ({dept.employeeCount} Subordinates)</span>
                            <span className="text-yellow-600 dark:text-yellow-500 font-bold font-mono">{dept.averageProgress}% Done</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-900">
                            <div 
                              className="h-full bg-yellow-500 rounded-full transition-all duration-500" 
                              style={{ width: `${dept.averageProgress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* QoQ completion cards */}
                  <div className="block">
                    <div className="block-ttl">Quarter-on-Quarter Completion Trends</div>
                    <div className="grid grid-cols-4 gap-4">
                      {qoqStats.map((q, idx) => (
                        <div key={idx} className="p-3 bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-250 dark:border-zinc-850 rounded-lg text-center">
                          <span className="text-[10px] text-zinc-500 block font-semibold font-mono uppercase tracking-wider">{q.quarter}</span>
                          <span className="text-xl font-extrabold text-zinc-800 dark:text-white mt-1 block">{q.averageProgress}%</span>
                          <span className="text-[10px] text-zinc-500 mt-0.5 block font-mono">{q.updateCount} updates</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* L1 Managers Leaderboard */}
                  <div className="block">
                    <div className="block-ttl">L1 Managers effectiveness leaderboard</div>
                    <div className="space-y-3 font-sans">
                      {managerStats.map((m, idx) => (
                        <div key={idx} className="p-3 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <strong className="text-zinc-800 dark:text-white block font-sans">{m.managerName}</strong>
                            <span className="text-zinc-500 text-[10px] font-mono">{m.email}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-green-600 dark:text-green-500">{m.completionRate}% check-ins logged</span>
                            <span className="text-[10px] text-zinc-500 block mt-0.5">{m.subordinateCount} subordinates</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Tab Content 4: System Audits diff */}
              {activeTab === 'audit' && (
                <div className="block">
                  <div className="block-ttl flex items-center gap-1.5">
                    <History size={16} className="text-yellow-500" /> System Governance Audit Trail
                  </div>
                  {logs.length === 0 ? (
                    <p className="text-zinc-500 text-xs font-mono">No audit entries recorded.</p>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {logs.map(log => (
                        <div key={log.id} className="p-3 bg-zinc-50/50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-850 text-xs">
                          <div className="flex justify-between items-center mb-2 border-b border-zinc-200 dark:border-zinc-950 pb-2">
                            <div>
                              <span className="font-semibold text-zinc-800 dark:text-white">{log.user.name} ({log.user.role})</span>
                              <span className="text-zinc-500 block text-[10px] mt-0.5">
                                Action: <strong className="text-yellow-600 dark:text-yellow-500">{log.action}</strong> {log.goal ? `on "${log.goal.title}"` : ''}
                              </span>
                            </div>
                            <span className="text-zinc-600 dark:text-zinc-500 text-[10px] font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>

                          {(log.before || log.after) && (
                            <div className="grid grid-cols-2 gap-4 mt-2 bg-zinc-100 dark:bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-900 font-mono">
                              <div>
                                <span className="text-zinc-500 block text-[10px] font-semibold mb-1 uppercase tracking-wider">Before State</span>
                                <p className="text-zinc-650 dark:text-zinc-400 text-[10px] break-all">{log.before || 'N/A'}</p>
                              </div>
                              <div className="border-l border-zinc-200 dark:border-zinc-900 pl-4">
                                <span className="text-zinc-500 block text-[10px] font-semibold mb-1 uppercase tracking-wider">After State</span>
                                <p className="text-zinc-800 dark:text-zinc-300 text-[10px] break-all">{log.after || 'N/A'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
