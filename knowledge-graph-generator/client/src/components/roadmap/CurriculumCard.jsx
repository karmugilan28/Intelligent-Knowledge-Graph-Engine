import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertTriangle, Play, BookOpen, Star, Target, Clock, ArrowRight } from 'lucide-react';

const CurriculumCard = memo(({ 
  step, 
  idx, 
  parsedGuide,
  isCompleted, 
  objectiveProgress,
  graphEdges,
  onToggleComplete,
  onToggleObjective
}) => {
  if (!parsedGuide) return null;

  // Compute Requires / Unlocks
  const requires = graphEdges ? graphEdges.filter(e => e.target === step.concept).map(e => e.source) : [];
  const unlocks = graphEdges ? graphEdges.filter(e => e.source === step.concept).map(e => e.target) : [];

  return (
    <div className="relative pl-12 z-10 w-full group">
      
      {/* Timeline Node */}
      <div 
        className={`absolute left-0 top-6 w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-md bg-[var(--bg-primary)]
          ${isCompleted ? 'border-[#10b981] text-[#10b981]' : 'border-[var(--border-primary)] text-[var(--text-secondary)] group-hover:border-[#06b6d4] group-hover:text-[#06b6d4]'}`}
      >
        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-black">{idx + 1}</span>}
      </div>

      {/* Content Card */}
      <motion.div 
        whileHover={{ y: -2 }}
        className={`rounded-xl border transition-all duration-300 relative overflow-hidden bg-[var(--bg-secondary)] shadow-sm
          ${isCompleted ? 'border-[#10b981]/50 bg-[#10b981]/5' : 'border-[var(--border-primary)] hover:border-[#06b6d4]/40 hover:shadow-md'}`}
      >
        {isCompleted && (
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#10b981]"></div>
        )}

        <div className="p-6 flex flex-col gap-6">
          
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-xl font-black mb-1 ${isCompleted ? 'text-[var(--text-primary)]' : 'text-[#06b6d4]'}`}>
                {step.concept}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">{step.description}</p>
            </div>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2.5">
            <span className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-3 py-1.5 rounded-md text-xs font-bold border border-[var(--border-primary)]">
               <Clock className="w-3.5 h-3.5 text-[#06b6d4]" />
               {step.estimatedTime}
            </span>
            <span className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-3 py-1.5 rounded-md text-xs font-bold border border-[var(--border-primary)]">
               <Target className="w-3.5 h-3.5 text-orange-500" />
               Difficulty {step.difficulty}/10
            </span>
          </div>

          {/* Actionable Objectives */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#06b6d4]" />
              Learning Objectives
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {parsedGuide.objectives.map((obj, i) => {
                const isObjDone = objectiveProgress[`${step.concept}_${i}`];
                return (
                  <div key={i} onClick={() => onToggleObjective(i)} className={`flex items-start gap-3 cursor-pointer group p-3 rounded-lg border transition-all ${isObjDone ? 'bg-[var(--bg-tertiary)] border-[var(--border-primary)]' : 'bg-[var(--bg-primary)] border-[var(--border-primary)] hover:border-[#06b6d4]/50'}`}>
                     <div className="mt-0.5 shrink-0">
                       {isObjDone 
                         ? <CheckCircle2 className="w-4 h-4 text-[#10b981]" /> 
                         : <Circle className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[#06b6d4] transition-colors" />
                       }
                     </div>
                     <span className={`text-sm select-none transition-all ${isObjDone ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)] group-hover:text-[#06b6d4]'}`}>
                       {obj}
                     </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prerequisite Badges (Requires/Unlocks) */}
          {(requires.length > 0 || unlocks.length > 0) && (
            <div className="flex flex-wrap gap-2.5 mt-[-4px]">
              {requires.length > 0 && (
                <span className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full text-[11px] font-bold">
                  Requires: {requires.join(', ')}
                </span>
              )}
              {unlocks.length > 0 && (
                <span className="flex items-center gap-1.5 bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20 px-3 py-1 rounded-full text-[11px] font-bold">
                  Unlocks: {unlocks.join(', ')}
                </span>
              )}
            </div>
          )}

          {/* Mini Project & Common Mistakes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 p-5 rounded-xl">
               <h4 className="text-xs font-black uppercase tracking-wider text-[#8b5cf6] mb-3 flex items-center gap-2">
                 <Play className="w-4 h-4" />
                 Mini Challenge
               </h4>
               <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                 {parsedGuide.miniProject}
               </p>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-xl">
               <h4 className="text-xs font-black uppercase tracking-wider text-orange-500 mb-3 flex items-center gap-2">
                 <AlertTriangle className="w-4 h-4" />
                 Common Mistakes
               </h4>
               <ul className="flex flex-col gap-2 list-none text-sm font-medium text-[var(--text-primary)]">
                 {parsedGuide.commonMistakes.map((mistake, i) => (
                   <li key={i} className="flex items-start gap-2 leading-snug">
                     <span className="text-orange-500 font-bold mt-[-2px]">•</span>
                     <span>{mistake}</span>
                   </li>
                 ))}
               </ul>
            </div>
          </div>

          {/* Expected Outcome & CTA */}
          <div className="bg-[#10b981]/10 border border-[#10b981]/30 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex items-start md:items-center gap-4">
               <div className="p-2.5 bg-[#10b981]/20 rounded-lg shrink-0">
                 <Star className="w-6 h-6 text-[#10b981]" />
               </div>
               <div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981] block mb-1">Expected Outcome</span>
                 <p className="text-sm font-bold text-[var(--text-primary)]">{parsedGuide.expectedOutcome}</p>
               </div>
             </div>
             
             <button 
                onClick={onToggleComplete}
                className={`py-2.5 px-6 rounded-lg font-black text-sm flex items-center gap-2 transition-all shrink-0
                  ${isCompleted ? 'bg-[#10b981] text-[var(--bg-primary)] hover:bg-[#10b981]/90' : 'bg-[#06b6d4] text-[var(--bg-primary)] hover:bg-[#06b6d4]/90'}`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <span>Complete Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
});

export default CurriculumCard;
