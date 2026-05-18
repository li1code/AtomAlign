import React, { useState } from 'react';
import api from '../../services/api';

export default function ManagerCheckin({ goalId, onUpdate }: { goalId: string, onUpdate: () => void }) {
  const [quarter, setQuarter] = useState('Q1');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/goals/${goalId}/checkin`, {
        quarter,
        comment
      });
      setSuccess(true);
      setComment('');
      onUpdate();
    } catch (err) {
      alert('Failed to save check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCheckin} className="mt-4 pt-4 border-t border-zinc-700/50">
      <h4 className="text-xs font-medium text-zinc-400 mb-2">Record Check-in</h4>
      <div className="flex gap-2">
        <select 
          value={quarter} 
          onChange={e => setQuarter(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded p-1 text-white text-xs focus:outline-none"
        >
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>
        <input 
          type="text" 
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Check-in notes..."
          required
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-1 text-white text-xs focus:outline-none"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-3 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Save'}
        </button>
      </div>
      {success && <p className="text-green-500 text-xs mt-1">Check-in recorded.</p>}
    </form>
  );
}
