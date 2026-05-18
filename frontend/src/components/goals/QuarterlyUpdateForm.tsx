import React, { useState } from 'react';
import api from '../../services/api';

export default function QuarterlyUpdateForm({ goal, onUpdate }: { goal: any, onUpdate: () => void }) {
  const [quarter, setQuarter] = useState('Q1');
  const [actual, setActual] = useState(0);
  const [status, setStatus] = useState('ON_TRACK');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post(`/goals/${goal.id}/progress`, { quarter, actualAchievement: actual, status });
      setSuccess('Progress updated successfully!');
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-white dark:bg-[#0D0D0D] border border-[#D4D4D8] dark:border-[rgba(255,255,255,0.1)] rounded-lg p-2 text-[#111] dark:text-[#F5F5F5] text-xs focus:border-[#FFB800] focus:outline-none transition-all";

  return (
    <div className="bg-[#F7F7F5] dark:bg-[#141414] p-4 rounded-xl border border-[#E8E8E4] dark:border-white/[0.07]">
      <h4 className="text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] mb-3 font-mono uppercase tracking-wider">Update Progress</h4>
      
      {error && <div className="mb-3 text-[#A32D2D] dark:text-[#E24B4A] text-xs">{error}</div>}
      {success && <div className="mb-3 text-[#3B6D11] dark:text-[#3DBF7A] text-xs">{success}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] mb-1 font-mono">Quarter</label>
          <select value={quarter} onChange={e => setQuarter(e.target.value)} className={inputClass + " w-full"}>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
            <option value="ANNUAL">Annual</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] mb-1 font-mono">Actual</label>
          <input type="number" value={actual} onChange={e => setActual(parseFloat(e.target.value))} className={inputClass + " w-full"} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] mb-1 font-mono">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass + " w-full"}>
            <option value="NOT_STARTED">Not Started</option>
            <option value="ON_TRACK">On Track</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#FFB800] hover:bg-[#E5A600] text-[#0D0D0D] text-xs font-semibold rounded-lg disabled:opacity-50 border-none transition-colors"
          >
            {loading ? 'Saving...' : 'Log Update'}
          </button>
        </div>
      </form>
    </div>
  );
}
