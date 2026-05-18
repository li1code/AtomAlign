import React, { useState } from 'react';
import api from '../../services/api';
import { Check, X, Edit3, Save } from 'lucide-react';

export default function ApprovalQueue({ pendingGoals, onAction }: { pendingGoals: any[], onAction: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  
  // Track inline edits by manager
  const [edits, setEdits] = useState<Record<string, { target: number; weightage: number }>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});

  const handleEditToggle = (goalId: string, currentTarget: number, currentWeightage: number) => {
    if (!isEditing[goalId]) {
      setEdits(prev => ({
        ...prev,
        [goalId]: { target: currentTarget, weightage: currentWeightage }
      }));
    }
    setIsEditing(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const handleFieldChange = (goalId: string, field: 'target' | 'weightage', value: number) => {
    setEdits(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value
      }
    }));
  };

  const handleAction = async (goalId: string, action: 'approve' | 'reject') => {
    setLoading(goalId);
    try {
      // 1. If inline edits are active, save the target and weightage adjustments first
      if (isEditing[goalId] && edits[goalId]) {
        await api.put(`/goals/${goalId}`, {
          target: edits[goalId].target,
          weightage: edits[goalId].weightage
        });
      }

      // 2. Process approval or rejection
      await api.post(`/approvals/${goalId}/${action}`, {
        comment: comments[goalId] || ''
      });

      // Clear states
      setIsEditing(prev => ({ ...prev, [goalId]: false }));
      onAction();
    } catch (err) {
      console.error(err);
      alert('Failed to process approval action');
    } finally {
      setLoading(null);
    }
  };

  const handleCommentChange = (goalId: string, value: string) => {
    setComments(prev => ({ ...prev, [goalId]: value }));
  };

  if (pendingGoals.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 shadow-xl text-center">
        <h2 className="text-xl font-bold mb-2 text-white">Approval Queue</h2>
        <p className="text-zinc-500 text-sm">No pending employee goal sheets require your review.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        Approval Queue <span className="bg-yellow-500 text-zinc-950 text-xs font-semibold py-0.5 px-2.5 rounded-full">{pendingGoals.length}</span>
      </h2>

      <div className="space-y-4">
        {pendingGoals.map(goal => {
          const editing = isEditing[goal.id];
          const currentEdit = edits[goal.id] || { target: goal.target, weightage: goal.weightage };

          return (
            <div key={goal.id} className="p-5 bg-zinc-900/60 rounded-xl border border-zinc-800 relative hover:border-zinc-700 transition-all">
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-white text-base">{goal.title}</h3>
                  <p className="text-xs text-yellow-500 font-medium mt-0.5">
                    {goal.employee?.name} &middot; {goal.employee?.department?.name || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => handleEditToggle(goal.id, goal.target, goal.weightage)}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded border border-zinc-700 flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 size={12} /> {editing ? 'Save Inline' : 'Edit Inline'}
                </button>
              </div>
              
              <p className="text-sm text-zinc-400 mb-4 mt-2 leading-relaxed">{goal.description}</p>
              
              {/* Target & Weightage Adjustment Fields */}
              <div className="grid grid-cols-2 gap-4 mb-5 text-sm bg-zinc-950/40 p-4 rounded-lg border border-zinc-850">
                <div>
                  <span className="text-zinc-500 block text-xs font-medium mb-1">Target Value</span>
                  {editing ? (
                    <input
                      type="number"
                      value={currentEdit.target}
                      onChange={e => handleFieldChange(goal.id, 'target', parseFloat(e.target.value) || 0)}
                      className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-white text-xs w-full focus:outline-none focus:border-yellow-500"
                    />
                  ) : (
                    <span className="text-white font-semibold">{goal.target}</span>
                  )}
                </div>
                <div>
                  <span className="text-zinc-500 block text-xs font-medium mb-1">Weightage Allocation (%)</span>
                  {editing ? (
                    <input
                      type="number"
                      value={currentEdit.weightage}
                      onChange={e => handleFieldChange(goal.id, 'weightage', parseFloat(e.target.value) || 0)}
                      className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-white text-xs w-full focus:outline-none focus:border-yellow-500"
                    />
                  ) : (
                    <span className="text-yellow-500 font-semibold">{goal.weightage}%</span>
                  )}
                </div>
              </div>

              {/* Manager Feedback */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Review Feedback Comment</label>
                <input 
                  type="text" 
                  value={comments[goal.id] || ''}
                  onChange={e => handleCommentChange(goal.id, e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white text-xs focus:ring-1 focus:ring-yellow-500 focus:outline-none placeholder-zinc-650" 
                  placeholder="Optional review or rejection comment..." 
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(goal.id, 'approve')}
                  disabled={loading === goal.id}
                  className="flex-1 py-2.5 px-4 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
                >
                  <Check size={16} /> Approve & Lock
                </button>
                <button 
                  onClick={() => handleAction(goal.id, 'reject')}
                  disabled={loading === goal.id}
                  className="flex-1 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
                >
                  <X size={16} /> Send Back
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
