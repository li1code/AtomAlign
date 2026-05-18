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
      await api.post(`/goals/${goal.id}/progress`, {
        quarter,
        actualAchievement: actual,
        status
      });
      setSuccess('Progress updated successfully!');
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 p-4 rounded-lg mt-4 border border-zinc-700/50">
      <h4 className="text-sm font-medium text-white mb-3">Update Progress</h4>
      
      {error && <div className="mb-3 text-red-400 text-xs">{error}</div>}
      {success && <div className="mb-3 text-green-400 text-xs">{success}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Quarter</label>
          <select 
            value={quarter} 
            onChange={e => setQuarter(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs focus:outline-none"
          >
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
            <option value="ANNUAL">Annual</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Actual</label>
          <input 
            type="number" 
            value={actual}
            onChange={e => setActual(parseFloat(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Status</label>
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-xs focus:outline-none"
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="ON_TRACK">On Track</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 text-xs font-semibold rounded disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Log Update'}
          </button>
        </div>
      </form>
    </div>
  );
}
