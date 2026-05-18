"use client";

import React, { useState } from 'react';
import api from '../../services/api';
import { Check, X, Edit3, Save, ChevronDown, ChevronUp } from 'lucide-react';

export default function ApprovalQueue({ pendingGoals, onAction }: { pendingGoals: any[], onAction: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [edits, setEdits] = useState<Record<string, { target: number; weightage: number }>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [expandedRow, setExpandedRow] = useState<Record<string, boolean>>({});

  const handleEditToggle = (goalId: string, currentTarget: number, currentWeightage: number) => {
    if (!isEditing[goalId]) {
      setEdits(prev => ({ ...prev, [goalId]: { target: currentTarget, weightage: currentWeightage } }));
    }
    setIsEditing(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const handleFieldChange = (goalId: string, field: 'target' | 'weightage', value: number) => {
    setEdits(prev => ({ ...prev, [goalId]: { ...prev[goalId], [field]: value } }));
  };

  const handleAction = async (goalId: string, action: 'approve' | 'reject') => {
    setLoading(goalId);
    try {
      if (isEditing[goalId] && edits[goalId]) {
        await api.put(`/goals/${goalId}`, { target: edits[goalId].target, weightage: edits[goalId].weightage });
      }
      await api.post(`/approvals/${goalId}/${action}`, { comment: comments[goalId] || '' });
      setIsEditing(prev => ({ ...prev, [goalId]: false }));
      onAction();
    } catch (err) {
      console.error(err);
      alert('Failed to process approval action');
    } finally {
      setLoading(null);
    }
  };

  const inputClass = "bg-white dark:bg-[#0D0D0D] border border-[#D4D4D8] dark:border-[rgba(255,255,255,0.1)] rounded-lg text-[#111] dark:text-[#F5F5F5] text-xs focus:border-[#FFB800] focus:outline-none transition-all";

  if (pendingGoals.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl p-6 text-center">
        <h2 className="text-sm font-semibold text-[#111] dark:text-[#F5F5F5] mb-1 font-syne">Approval Queue</h2>
        <p className="text-[#888] dark:text-[#A8A8A0] text-xs">No pending goal sheets require review.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-[#E8E8E4] dark:border-white/[0.07] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#E8E8E4] dark:border-white/[0.07] bg-[#F7F7F5] dark:bg-[#141414] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#111] dark:text-[#F5F5F5] flex items-center gap-2 font-syne">
          Approval Queue 
          <span className="badge badge-submitted text-[9px]">{pendingGoals.length} Pending</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E8E8E4] dark:border-white/[0.07] text-[#888] dark:text-[#A8A8A0] bg-[#F7F7F5] dark:bg-[#141414] font-mono text-[10px] uppercase tracking-wider">
              <th className="py-3 px-4 w-8"></th>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Goal Title & Thrust</th>
              <th className="py-3 px-4">Target</th>
              <th className="py-3 px-4">Weightage</th>
              <th className="py-3 px-4">Feedback Comment</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E4] dark:divide-white/[0.07]">
            {pendingGoals.map(goal => {
              const editing = isEditing[goal.id];
              const isExpanded = expandedRow[goal.id];
              const currentEdit = edits[goal.id] || { target: goal.target, weightage: goal.weightage };

              return (
                <React.Fragment key={goal.id}>
                  <tr className="hover:bg-[#F7F7F5] dark:hover:bg-[#141414] transition-colors">
                    <td className="py-3 px-4">
                      <button onClick={() => setExpandedRow(prev => ({ ...prev, [goal.id]: !prev[goal.id] }))}
                        className="p-1 text-[#888] hover:text-[#111] dark:hover:text-[#F5F5F5] rounded transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[rgba(255,184,0,0.12)] text-[#FFB800] flex items-center justify-center font-semibold text-[10px]">
                          {goal.employee?.name?.slice(0, 2).toUpperCase() || 'EM'}
                        </div>
                        <div>
                          <p className="text-[#111] dark:text-[#F5F5F5] font-semibold">{goal.employee?.name}</p>
                          <p className="text-[10px] text-[#888] dark:text-[#A8A8A0]">{goal.employee?.department?.name || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-[#111] dark:text-[#F5F5F5] font-semibold">{goal.title}</p>
                      <p className="text-[10px] text-[#888] dark:text-[#A8A8A0] font-mono mt-0.5">{goal.thrustArea}</p>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {editing ? (
                        <input type="number" value={currentEdit.target}
                          onChange={e => handleFieldChange(goal.id, 'target', parseFloat(e.target.value) || 0)}
                          className={inputClass + " w-16 px-1.5 py-0.5"} />
                      ) : (
                        <span className="text-[#111] dark:text-[#F5F5F5] font-semibold">{goal.target} {goal.uomType}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {editing ? (
                        <input type="number" value={currentEdit.weightage}
                          onChange={e => handleFieldChange(goal.id, 'weightage', parseFloat(e.target.value) || 0)}
                          className={inputClass + " w-16 px-1.5 py-0.5"} />
                      ) : (
                        <span className="text-[#FFB800] font-semibold">{goal.weightage}%</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <input type="text" value={comments[goal.id] || ''}
                        onChange={e => setComments(prev => ({ ...prev, [goal.id]: e.target.value }))}
                        className={inputClass + " w-full px-2 py-1 placeholder:text-[#BBB] dark:placeholder:text-[rgba(168,168,160,0.4)]"}
                        placeholder="Review comment..." />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleEditToggle(goal.id, goal.target, goal.weightage)}
                          className="p-1.5 bg-[#F7F7F5] dark:bg-[#141414] hover:bg-[#F0EFEB] dark:hover:bg-[rgba(255,255,255,0.04)] text-[#555] dark:text-[#A8A8A0] rounded-lg border border-[#E8E8E4] dark:border-white/[0.07] transition-colors"
                          title={editing ? "Save Parameters" : "Edit Inline"}
                        >
                          {editing ? <Save size={12} /> : <Edit3 size={12} />}
                        </button>
                        <button onClick={() => handleAction(goal.id, 'approve')} disabled={loading === goal.id}
                          className="p-1.5 bg-[#EAF3DE] dark:bg-[rgba(61,191,122,0.1)] hover:bg-[#d4edbe] dark:hover:bg-[rgba(61,191,122,0.15)] text-[#3B6D11] dark:text-[#3DBF7A] border border-[#97C459] dark:border-[rgba(61,191,122,0.25)] rounded-lg transition-colors disabled:opacity-50"
                          title="Approve & Lock"
                        >
                          <Check size={12} />
                        </button>
                        <button onClick={() => handleAction(goal.id, 'reject')} disabled={loading === goal.id}
                          className="p-1.5 bg-[#FCEBEB] dark:bg-[rgba(226,75,74,0.1)] hover:bg-[#f9d5d5] dark:hover:bg-[rgba(226,75,74,0.15)] text-[#A32D2D] dark:text-[#E24B4A] border border-[#F09595] dark:border-[rgba(226,75,74,0.25)] rounded-lg transition-colors disabled:opacity-50"
                          title="Send Back"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-[#F7F7F5] dark:bg-[#141414]">
                      <td colSpan={7} className="py-3 px-8 text-[#555] dark:text-[#A8A8A0]">
                        <div className="space-y-1">
                          <p className="font-semibold text-[#111] dark:text-[#F5F5F5] text-xs">Goal Description:</p>
                          <p className="text-xs italic leading-relaxed">"{goal.description}"</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
