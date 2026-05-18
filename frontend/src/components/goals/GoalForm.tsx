import React, { useState, useEffect } from 'react';
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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 shadow-xl relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Create Goals</h2>
        <div className={`px-4 py-2 rounded-lg border font-medium ${totalWeightage === 100 ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
          Total Weightage: {totalWeightage}%
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-900/50 border border-green-500/50 rounded-lg text-green-200 text-sm">{success}</div>}

      <div className="space-y-6">
        {goals.map((goal, index) => (
          <div key={index} className="p-5 bg-zinc-800/30 rounded-lg border border-zinc-700/50 relative group">
            <button 
              onClick={() => removeGoal(index)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={18} />
            </button>
            <h3 className="text-zinc-400 font-medium mb-4 text-sm">Goal #{index + 1}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Title</label>
                <input 
                  type="text" 
                  value={goal.title} 
                  onChange={e => updateGoal(index, 'title', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white text-sm focus:ring-1 focus:ring-yellow-500 focus:outline-none" 
                  placeholder="e.g. Increase Sales Q1" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Thrust Area</label>
                <input 
                  type="text" 
                  value={goal.thrustArea} 
                  onChange={e => updateGoal(index, 'thrustArea', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white text-sm focus:ring-1 focus:ring-yellow-500 focus:outline-none" 
                  placeholder="e.g. Revenue Growth" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
                <textarea 
                  value={goal.description} 
                  onChange={e => updateGoal(index, 'description', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white text-sm focus:ring-1 focus:ring-yellow-500 focus:outline-none h-20" 
                  placeholder="Detailed description of the goal..." 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">UoM Type</label>
                <select 
                  value={goal.uomType} 
                  onChange={e => updateGoal(index, 'uomType', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white text-sm focus:ring-1 focus:ring-yellow-500 focus:outline-none"
                >
                  <option value="NUMERIC_MIN">Numeric (Higher is better)</option>
                  <option value="NUMERIC_MAX">Numeric (Lower is better)</option>
                  <option value="PERCENT_MIN">Percentage (Higher is better)</option>
                  <option value="PERCENT_MAX">Percentage (Lower is better)</option>
                  <option value="TIMELINE">Timeline (Date-based)</option>
                  <option value="ZERO_BASED">Zero-based (Incidents)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Target</label>
                  <input 
                    type="number" 
                    value={goal.target || ''} 
                    onChange={e => updateGoal(index, 'target', parseFloat(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white text-sm focus:ring-1 focus:ring-yellow-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Weightage (%)</label>
                  <input 
                    type="number" 
                    value={goal.weightage || ''} 
                    onChange={e => updateGoal(index, 'weightage', parseFloat(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white text-sm focus:ring-1 focus:ring-yellow-500 focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {goals.length < 8 && (
          <button 
            onClick={addGoal}
            className="w-full py-3 border border-dashed border-zinc-700 rounded-lg text-zinc-400 hover:text-yellow-500 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Goal
          </button>
        )}
      </div>

      <div className="mt-8 flex gap-4 border-t border-zinc-800 pt-6">
        <button 
          onClick={() => handleAction('draft')}
          disabled={loading}
          className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={18} /> Save as Draft
        </button>
        <button 
          onClick={() => handleAction('submit')}
          disabled={loading}
          className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-semibold rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={18} /> Submit for Approval
        </button>
      </div>
    </div>
  );
}
