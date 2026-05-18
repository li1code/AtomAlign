import React, { useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Save, Send } from 'lucide-react';

interface Goal {
  title: string;
  description: string;
  thrustArea: string;
  target: number;
  weightage: number;
  uomType: string;
}

export default function GoalForm({ existingGoals, onGoalsSaved }: { existingGoals: any[], onGoalsSaved: (g: any[]) => void }) {
  const [goals, setGoals] = useState<Goal[]>(
    existingGoals.length > 0 
      ? existingGoals 
      : [{ title: '', description: '', thrustArea: '', target: 0, weightage: 0, uomType: 'NUMERIC_MIN' }]
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const totalWeightage = goals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);

  const addGoal = () => {
    if (goals.length >= 8) {
      setError('Maximum 8 goals allowed.');
      return;
    }
    setGoals([...goals, { title: '', description: '', thrustArea: '', target: 0, weightage: 0, uomType: 'NUMERIC_MIN' }]);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: keyof Goal, value: string | number) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const validate = () => {
    setError('');
    setSuccess('');
    if (goals.some(g => !g.title || !g.description || !g.thrustArea)) {
      setError('Please fill out all text fields.');
      return false;
    }
    if (goals.some(g => Number(g.weightage) < 10)) {
      setError('Each goal must have at least 10% weightage.');
      return false;
    }
    if (totalWeightage !== 100) {
      setError(`Total weightage must be exactly 100%. Currently at ${totalWeightage}%.`);
      return false;
    }
    return true;
  };

  const handleAction = async (action: 'draft' | 'submit') => {
    if (action === 'submit' && !validate()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/goals/${action}`, { goals });
      setSuccess(`Goals ${action === 'draft' ? 'saved as draft' : 'submitted'} successfully!`);
      onGoalsSaved(res.data.goals);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-5 relative">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-[#111] dark:text-[#F5F5F5] font-syne">Create Goals</h2>
        <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold font-mono uppercase tracking-wider ${totalWeightage === 100 ? 'badge-approved' : 'badge-submitted'}`}>
          Total Weightage: {totalWeightage}%
        </div>
      </div>

      {error && <div className="mb-5 p-3 bg-[#FCEBEB] dark:bg-[rgba(226,75,74,0.1)] border border-[#F09595] dark:border-[rgba(226,75,74,0.25)] rounded-lg text-[#A32D2D] dark:text-[#E24B4A] text-xs">{error}</div>}
      {success && <div className="mb-5 p-3 bg-[#EAF3DE] dark:bg-[rgba(61,191,122,0.1)] border border-[#97C459] dark:border-[rgba(61,191,122,0.25)] rounded-lg text-[#3B6D11] dark:text-[#3DBF7A] text-xs">{success}</div>}

      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="p-4 bg-[#F7F7F5] dark:bg-[#141414] rounded-xl border border-[#E8E8E4] dark:border-white/[0.07] relative group">
            <button 
              onClick={() => removeGoal(index)}
              className="absolute top-3 right-3 text-[#888] hover:text-[#E24B4A] transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <h3 className="text-[#888] dark:text-[#A8A8A0] font-semibold mb-3 text-[10px] font-mono uppercase tracking-wider">Goal #{index + 1}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] mb-1 font-mono uppercase tracking-wider">Title</label>
                <input type="text" value={goal.title} onChange={e => updateGoal(index, 'title', e.target.value)}
                  className="w-full bg-white dark:bg-[#0D0D0D] border border-[#D4D4D8] dark:border-[rgba(255,255,255,0.1)] rounded-lg p-2.5 text-[#111] dark:text-[#F5F5F5] text-sm focus:border-[#FFB800] focus:outline-none placeholder:text-[#BBB] dark:placeholder:text-[rgba(168,168,160,0.4)] transition-all" 
                  placeholder="e.g. Increase Sales Q1" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] mb-1 font-mono uppercase tracking-wider">Thrust Area</label>
                <input type="text" value={goal.thrustArea} onChange={e => updateGoal(index, 'thrustArea', e.target.value)}
                  className="w-full bg-white dark:bg-[#0D0D0D] border border-[#D4D4D8] dark:border-[rgba(255,255,255,0.1)] rounded-lg p-2.5 text-[#111] dark:text-[#F5F5F5] text-sm focus:border-[#FFB800] focus:outline-none placeholder:text-[#BBB] dark:placeholder:text-[rgba(168,168,160,0.4)] transition-all" 
                  placeholder="e.g. Revenue Growth" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] mb-1 font-mono uppercase tracking-wider">Description</label>
                <textarea value={goal.description} onChange={e => updateGoal(index, 'description', e.target.value)}
                  className="w-full bg-white dark:bg-[#0D0D0D] border border-[#D4D4D8] dark:border-[rgba(255,255,255,0.1)] rounded-lg p-2.5 text-[#111] dark:text-[#F5F5F5] text-sm focus:border-[#FFB800] focus:outline-none placeholder:text-[#BBB] dark:placeholder:text-[rgba(168,168,160,0.4)] transition-all h-20" 
                  placeholder="Detailed description of the goal..." 
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] mb-1 font-mono uppercase tracking-wider">UoM Type</label>
                <select value={goal.uomType} onChange={e => updateGoal(index, 'uomType', e.target.value)}
                  className="w-full bg-white dark:bg-[#0D0D0D] border border-[#D4D4D8] dark:border-[rgba(255,255,255,0.1)] rounded-lg p-2.5 text-[#111] dark:text-[#F5F5F5] text-sm focus:border-[#FFB800] focus:outline-none transition-all"
                >
                  <option value="NUMERIC_MIN">Numeric (Higher is better)</option>
                  <option value="NUMERIC_MAX">Numeric (Lower is better)</option>
                  <option value="PERCENT_MIN">Percentage (Higher is better)</option>
                  <option value="PERCENT_MAX">Percentage (Lower is better)</option>
                  <option value="TIMELINE">Timeline (Date-based)</option>
                  <option value="ZERO_BASED">Zero-based (Incidents)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] mb-1 font-mono uppercase tracking-wider">Target</label>
                  <input type="number" value={goal.target || ''} onChange={e => updateGoal(index, 'target', parseFloat(e.target.value))}
                    className="w-full bg-white dark:bg-[#0D0D0D] border border-[#D4D4D8] dark:border-[rgba(255,255,255,0.1)] rounded-lg p-2.5 text-[#111] dark:text-[#F5F5F5] text-sm focus:border-[#FFB800] focus:outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] dark:text-[#A8A8A0] mb-1 font-mono uppercase tracking-wider">Weightage (%)</label>
                  <input type="number" value={goal.weightage || ''} onChange={e => updateGoal(index, 'weightage', parseFloat(e.target.value))}
                    className="w-full bg-white dark:bg-[#0D0D0D] border border-[#D4D4D8] dark:border-[rgba(255,255,255,0.1)] rounded-lg p-2.5 text-[#111] dark:text-[#F5F5F5] text-sm focus:border-[#FFB800] focus:outline-none transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {goals.length < 8 && (
          <button onClick={addGoal}
            className="w-full py-3 border-2 border-dashed border-[#D4D4D8] dark:border-white/[0.1] rounded-xl text-[#888] dark:text-[#A8A8A0] hover:text-[#FFB800] hover:border-[#FFB800] hover:bg-[rgba(255,184,0,0.03)] transition-all flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold"
          >
            <Plus size={16} /> Add Goal
          </button>
        )}
      </div>

      <div className="mt-6 flex gap-3 border-t border-[#E8E8E4] dark:border-white/[0.07] pt-5">
        <button onClick={() => handleAction('draft')} disabled={loading}
          className="flex-1 py-3 px-4 bg-[#F7F7F5] dark:bg-[#1A1A1A] border border-[#E0E0DC] dark:border-white/[0.07] text-[#555] dark:text-[#A8A8A0] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#F0EFEB] dark:hover:bg-[#141414] text-sm"
        >
          <Save size={16} /> Save as Draft
        </button>
        <button onClick={() => handleAction('submit')} disabled={loading}
          className="flex-1 py-3 px-4 bg-[#FFB800] hover:bg-[#E5A600] text-[#0D0D0D] font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 border-none text-sm"
        >
          <Send size={16} /> Submit for Approval
        </button>
      </div>
    </div>
  );
}
