import React from 'react';
import { Target, CheckCircle } from 'lucide-react';

const MilestoneAnalytics = ({ milestones }) => {
  if (!milestones || Object.keys(milestones).length === 0) return null;

  const milestoneOrder = ['Foundation', 'Intermediate', 'Advanced'];

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4 text-[#06b6d4]" />
        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">Milestone Progress</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {milestoneOrder.map(type => {
          if (!milestones[type]) return null;
          const { total, completed } = milestones[type];
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          return (
            <div key={type} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-secondary)]">
                <span>{type}</span>
                <span>{completed} / {total}</span>
              </div>
              <div className="w-full bg-[var(--bg-primary)] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${percent === 100 ? 'bg-[#a3e635]' : 'bg-[#06b6d4]'}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneAnalytics;
