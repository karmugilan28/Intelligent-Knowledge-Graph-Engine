import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, ArrowRight, TrendingUp, Clock, GitBranch, Map } from 'lucide-react';
import { motion } from 'framer-motion';

const RecommendationPanel = ({ documentId, roadmap, onSelectRecommendation }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roadmap || !roadmap._id) {
      setLoading(false);
      return;
    }
    
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get(`/api/learning-path/${roadmap._id}/recommend`);
        if (res.data.success) {
          setRecommendations(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [roadmap]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-6 w-full max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-1 items-center text-center max-w-lg mx-auto mb-4">
          <div className="w-24 h-6 bg-[var(--bg-tertiary)] rounded-full mb-2"></div>
          <div className="w-64 h-8 bg-[var(--bg-tertiary)] rounded mb-2"></div>
          <div className="w-80 h-4 bg-[var(--bg-tertiary)] rounded"></div>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {[1, 2, 3].map(i => (
            <motion.div 
              key={i}
              animate={{ opacity: [0.5, 1, 0.5] }} 
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 min-w-[280px] max-w-[340px] flex-1 h-[340px]"
            ></motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (!roadmap) return null;

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] max-w-2xl mx-auto shadow-sm">
        <div className="p-4 rounded-full bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10 border border-[#8b5cf6]/20 shadow-lg mb-5 relative">
           <Map className="w-8 h-8 text-[#8b5cf6] relative z-10" />
        </div>
        <h3 className="text-xl font-black text-[var(--text-primary)]">No recommendations yet</h3>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm">
          Complete a lesson or step to unlock personalized curriculum suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6 w-full max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-1 items-center text-center max-w-lg mx-auto mb-4">
        <span className="text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/20 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full mb-2">
          Next Steps
        </span>
        <h3 className="text-2xl font-black text-[var(--text-primary)]">Recommended Journeys</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Based on your completed milestones, exploring these concepts next will maximize your knowledge graph coverage.
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-6">
        {recommendations.slice(0, 3).map((rec, idx) => {
          const confidence = Math.min(99, Math.round(rec.score * 10));
          return (
            <div key={idx} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 flex flex-col gap-5 min-w-[280px] max-w-[340px] flex-1 relative overflow-hidden group hover:border-[#06b6d4]/50 transition-all hover:shadow-xl hover:-translate-y-1">
              {/* Subtle top gradient line */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#06b6d4] to-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-start justify-between">
                <h4 className="text-xl font-black text-[var(--text-primary)]">{rec.concept}</h4>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-wider">
                    {confidence}% Match
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] p-2.5 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)] mb-1 text-[10px] font-black uppercase tracking-widest">
                    <Clock className="w-3 h-3 text-[#10b981]" />
                    Est. Time
                  </div>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {Math.max(2, Math.round((rec.difficulty || 5) * 1.5))} hrs
                  </span>
                </div>
                <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] p-2.5 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)] mb-1 text-[10px] font-black uppercase tracking-widest">
                    <TrendingUp className="w-3 h-3 text-orange-500" />
                    Diff. Jump
                  </div>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    +{Math.max(1, Math.abs(rec.difficulty - (roadmap?.path?.[roadmap?.path.length - 1]?.difficulty || 5)))}
                  </span>
                </div>
                <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] p-2.5 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)] mb-1 text-[10px] font-black uppercase tracking-widest">
                    <GitBranch className="w-3 h-3 text-[#06b6d4]" />
                    Needed By
                  </div>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {Math.floor(rec.score * 8) + 1}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-[var(--text-primary)] flex-grow flex flex-col gap-2">
                <span className="font-black text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Why this?</span>
                <span className="leading-relaxed font-medium">{rec.reasoning}</span>
              </div>
              
              <button
                onClick={() => onSelectRecommendation(rec.concept)}
                className="w-full bg-[#06b6d4]/10 hover:bg-[#06b6d4] text-[#06b6d4] hover:text-[var(--bg-primary)] text-sm font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-2"
              >
                <span>Generate Curriculum</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationPanel;
