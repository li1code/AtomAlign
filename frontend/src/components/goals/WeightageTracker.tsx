import React from 'react';

interface Goal {
  title: string;
  weightage: number;
}

interface WeightageTrackerProps {
  goals: Goal[];
}

export default function WeightageTracker({ goals }: WeightageTrackerProps) {
  const total = goals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);

  // Determine active status colors and message
  let statusColor = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
  let barColor = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]';
  let message = `Under-allocated: Add ${100 - total}% more weightage.`;

  if (total === 100) {
    statusColor = 'text-green-500 bg-green-500/10 border-green-500/20';
    barColor = 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]';
    message = 'Balanced: Ready for submission!';
  } else if (total > 100) {
    statusColor = 'text-red-500 bg-red-500/10 border-red-500/20';
    barColor = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
    message = `Over-allocated: Exceeded by ${total - 100}%.`;
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-sm text-white">Weightage Allocation</h4>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColor} transition-all`}>
          {total}% / 100%
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-3 relative">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`} 
          style={{ width: `${Math.min(total, 100)}%` }} 
        />
      </div>

      <p className="text-xs text-zinc-400 mb-4">{message}</p>

      {/* Mini Allocation Stack */}
      {goals.length > 0 && (
        <div className="space-y-2 mt-2">
          {goals.map((g, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 truncate max-w-[180px]">
                {g.title || `Goal #${idx + 1}`}
              </span>
              <span className="font-medium text-zinc-300">
                {g.weightage || 0}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
