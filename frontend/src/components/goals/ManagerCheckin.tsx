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
      await api.post(`/goals/${goalId}/checkin`, { quarter, comment });
      setSuccess(true);
      setComment('');
      onUpdate();
    } catch (err) {
      alert('Failed to save check-in');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-white dark:bg-[#0D0D0D] border border-[#D4D4D8] dark:border-[rgba(255,255,255,0.1)] rounded-lg p-2 text-[#111] dark:text-[#F5F5F5] text-xs focus:border-[#FFB800] focus:outline-none transition-all";

  return (
    <form onSubmit={handleCheckin} className="mt-3 pt-3 border-t border-[#E8E8E4] dark:border-white/[0.07]">
      <h4 className="text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] mb-2 font-mono uppercase tracking-wider">Record Check-in</h4>
      <div className="flex gap-2">
        <select value={quarter} onChange={e => setQuarter(e.target.value)} className={inputClass}>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>
        <input 
          type="text" value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Check-in notes..."
          required
          className={inputClass + " flex-1 placeholder:text-[#BBB] dark:placeholder:text-[rgba(168,168,160,0.4)]"}
        />
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-[#FFB800] hover:bg-[#E5A600] text-[#0D0D0D] font-semibold text-xs rounded-lg border-none transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Save'}
        </button>
      </div>
      {success && <p className="text-[#3B6D11] dark:text-[#3DBF7A] text-xs mt-1">Check-in recorded.</p>}
    </form>
  );
}
