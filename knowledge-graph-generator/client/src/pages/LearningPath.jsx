import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Compass,
  ChevronRight,
  Database,
  RefreshCw,
  Sparkles,
  Trophy,
  Download,
  FileText,
  BookOpen,
  Star,
  Presentation,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import AppShell from '../components/AppShell.jsx';
import { parseStudyGuide } from '../utils/roadmap.utils.js';
import { exportToJSON, exportToMarkdown } from '../utils/export.utils.js';
import RecommendationPanel from '../components/roadmap/RecommendationPanel.jsx';
import CurriculumCard from '../components/roadmap/CurriculumCard.jsx';
import ConfirmModal from '../components/roadmap/ConfirmModal.jsx';
import ToastContainer from '../components/ui/ToastContainer.jsx';
import { getDemoCurriculum } from '../utils/demoCurriculum.js';

const LearningPath = () => {
  const { documentId } = useParams();
  
  const [concepts, setConcepts] = useState([]);
  const [targetConcept, setTargetConcept] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [graphEdges, setGraphEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [completedSteps, setCompletedSteps] = useState({});
  const [objectiveProgress, setObjectiveProgress] = useState({});
  const [parsedGuide, setParsedGuide] = useState({});
  const [undoModalStep, setUndoModalStep] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [exportingTarget, setExportingTarget] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  const addToast = useCallback((title, message, type) => {
    const id = Date.now() + Math.random();
    setToasts(prev => {
      const newToasts = [...prev, { id, title, message, type }];
      if (newToasts.length > 3) newToasts.shift();
      return newToasts;
    });
    
    const duration = 4000;
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  useEffect(() => {
    const fetchGraphNodes = async () => {
      try {
        const response = await axios.get(`/api/graph/${documentId}`);
        if (response.data.success) {
          const { nodes, edges } = response.data.data.graph;
          setConcepts(nodes.map(n => n.id));
          setGraphEdges(edges || []);
          if (nodes.length > 0) {
            setTargetConcept(nodes[nodes.length - 1].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch concepts for roadmap:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGraphNodes();
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;
    try {
      const savedCompleted = localStorage.getItem(`completed_steps_${documentId}`);
      if (savedCompleted) setCompletedSteps(JSON.parse(savedCompleted));
      const savedObjectives = localStorage.getItem(`objective_progress_${documentId}`);
      if (savedObjectives) setObjectiveProgress(JSON.parse(savedObjectives));
    } catch (err) {
      console.error('Failed to load user progress:', err);
    }
  }, [documentId]);

  useEffect(() => {
    if (roadmap && roadmap.studyGuide) {
      const parsed = parseStudyGuide(roadmap.studyGuide, roadmap.path);
      setParsedGuide(parsed);
      if (roadmap.progress && roadmap.progress.completedSteps) {
        const dbCompleted = {};
        roadmap.progress.completedSteps.forEach(step => { dbCompleted[step] = true; });
        setCompletedSteps(prev => ({ ...prev, ...dbCompleted }));
      }
    }
  }, [roadmap]);

  const handleGeneratePath = async (e) => {
    e.preventDefault();
    if (!targetConcept) return;
    try {
      setGenerating(true);
      setIsDemoMode(false);
      const response = await axios.post('/api/learning-path', { documentId, targetConcept });
      if (response.data.success) {
        setRoadmap(response.data.data);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Failed to generate learning path:', err.message);
      const demoRoadmap = getDemoCurriculum(targetConcept);
      setRoadmap(demoRoadmap);
      setIsDemoMode(true);
      addToast('AI temporarily unavailable', 'Showing educational demo curriculum.', 'warning');
    } finally {
      setGenerating(false);
    }
  };

  const applyCompletionToggle = async (conceptName, objectivesList, nextState) => {
    setCompletedSteps(prev => {
      const newCompletedSteps = { ...prev, [conceptName]: nextState };
      
      if (roadmap?._id) {
        const completedArr = Object.keys(newCompletedSteps).filter(k => newCompletedSteps[k]);
        axios.put(`/api/learning-path/${roadmap._id}/progress`, { completedSteps: completedArr })
          .then(() => {
             if (nextState) addToast('Progress Updated', `Completed ${conceptName}`, 'progress');
          })
          .catch(err => console.error(err));
      } else {
        localStorage.setItem(`completed_steps_${documentId}`, JSON.stringify(newCompletedSteps));
        if (nextState) addToast('Progress Updated', `Completed ${conceptName}`, 'progress');
      }
      return newCompletedSteps;
    });

    if (objectivesList.length > 0) {
      setObjectiveProgress(prev => {
        const newProgress = { ...prev };
        objectivesList.forEach((_, idx) => {
          newProgress[`${conceptName}_${idx}`] = nextState;
        });
        localStorage.setItem(`objective_progress_${documentId}`, JSON.stringify(newProgress));
        return newProgress;
      });
    }
  };

  const handleToggleComplete = useCallback((conceptName, objectivesList = []) => {
    if (completedSteps[conceptName]) {
      setUndoModalStep({ conceptName, objectivesList });
      return;
    }
    applyCompletionToggle(conceptName, objectivesList, true);
  }, [completedSteps, roadmap, documentId, addToast]);

  const handleToggleObjective = useCallback((conceptName, objIdx, objectivesList) => {
    const key = `${conceptName}_${objIdx}`;
    
    setObjectiveProgress(prev => {
      const nextVal = !prev[key];
      const newProgress = { ...prev, [key]: nextVal };
      localStorage.setItem(`objective_progress_${documentId}`, JSON.stringify(newProgress));
      
      const allCompleted = objectivesList.every((_, idx) => {
        const k = `${conceptName}_${idx}`;
        return k === key ? nextVal : !!newProgress[k];
      });

      setCompletedSteps(prevComp => {
        const newCompleted = { ...prevComp, [conceptName]: allCompleted };
        if (roadmap?._id) {
          const completedArr = Object.keys(newCompleted).filter(k => newCompleted[k]);
          axios.put(`/api/learning-path/${roadmap._id}/progress`, { completedSteps: completedArr })
            .then(() => {
               if (allCompleted) addToast('Progress Updated', `Completed ${conceptName}`, 'progress');
            })
            .catch(err => console.error(err));
        } else {
          localStorage.setItem(`completed_steps_${documentId}`, JSON.stringify(newCompleted));
          if (allCompleted) addToast('Progress Updated', `Completed ${conceptName}`, 'progress');
        }
        return newCompleted;
      });
      
      return newProgress;
    });
  }, [roadmap, documentId]);

  const handleExportPDF = () => {
    setExportingTarget('pdf');
    setTimeout(() => {
      window.print();
      addToast('Export Complete', 'PDF has been generated', 'export');
      setExportingTarget(null);
    }, 500);
  };
  
  const wrappedExportToJSON = () => {
    setExportingTarget('json');
    exportToJSON(roadmap, roadmap.targetConcept);
    addToast('Export Complete', 'JSON downloaded successfully', 'export');
    setTimeout(() => setExportingTarget(null), 1000);
  };

  const wrappedExportToMarkdown = () => {
    setExportingTarget('md');
    exportToMarkdown(roadmap, roadmap.targetConcept);
    addToast('Export Complete', 'Markdown downloaded successfully', 'export');
    setTimeout(() => setExportingTarget(null), 1000);
  };

  // Calculations for stats
  const totalSteps = roadmap ? roadmap.path.length : 0;
  const completedCount = roadmap ? roadmap.path.filter(step => completedSteps[step.concept]).length : 0;
  const percentComplete = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const totalHours = roadmap ? roadmap.path.reduce((acc, step) => {
    const match = step.estimatedTime.match(/(\d+)/);
    return acc + (match ? parseInt(match[1]) : 0);
  }, 0) : 0;

  const completedHours = roadmap ? roadmap.path.filter(step => completedSteps[step.concept]).reduce((acc, step) => {
    const match = step.estimatedTime.match(/(\d+)/);
    return acc + (match ? parseInt(match[1]) : 0);
  }, 0) : 0;
    
  const remainingHours = totalHours - completedHours;

  const estimatedCompletionDate = useMemo(() => {
    if (!remainingHours) return 'N/A';
    const date = new Date();
    // Assume 10 hours a week study
    const daysToAdd = Math.ceil((remainingHours / 10) * 7);
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [remainingHours]);

  const milestonesData = useMemo(() => {
    if (!roadmap) return { milestones: [], currentStageObj: null, nextStageObj: null };
    
    const types = ['FOUNDATION', 'INTERMEDIATE', 'ADVANCED', 'MASTERY'];
    const groups = {
      FOUNDATION: [],
      INTERMEDIATE: [],
      ADVANCED: [],
      MASTERY: []
    };
    
    const total = roadmap.path.length;
    roadmap.path.forEach((step, idx) => {
      let type;
      if (idx < total * 0.25) type = 'FOUNDATION';
      else if (idx < total * 0.5) type = 'INTERMEDIATE';
      else if (idx < total * 0.75) type = 'ADVANCED';
      else type = 'MASTERY';
      groups[type].push({ step, idx });
    });
    
    const filteredTypes = types.map(type => ({
      title: type,
      items: groups[type]
    })).filter(g => g.items.length > 0);

    let currentStageObj = filteredTypes[filteredTypes.length - 1];
    let activeIdx = filteredTypes.findIndex(m => !m.items.every(item => completedSteps[item.step.concept]));
    if (activeIdx !== -1) currentStageObj = filteredTypes[activeIdx];
    
    let nextStageObj = activeIdx !== -1 && activeIdx + 1 < filteredTypes.length ? filteredTypes[activeIdx + 1] : null;

    return { milestones: filteredTypes, currentStageObj, nextStageObj };
  }, [roadmap, completedSteps]);

  const { milestones, currentStageObj, nextStageObj } = milestonesData;
  const currentXP = completedCount * 50;

  return (
    <AppShell activeDocumentId={documentId}>
      <div className="w-full px-6 lg:px-10 max-w-[1200px] mx-auto py-10 flex flex-col gap-8">
        
        {/* Sleek Top Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <Compass className="w-8 h-8 text-[#06b6d4]" />
              <span>Premium Learning Journey</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Structured curriculum optimized for pedagogical progression and mastery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!presentationMode ? (
              <>
                {roadmap && (
                  <>
                    <button onClick={() => setPresentationMode(true)} className="bg-[var(--bg-tertiary)] hover:border-[#06b6d4] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm" title="Presentation Mode">
                      <Presentation className="w-3.5 h-3.5 text-[#06b6d4]" />
                      <span>Present</span>
                    </button>
                    <button disabled={!!exportingTarget} onClick={wrappedExportToJSON} className="bg-[var(--bg-tertiary)] hover:border-[#06b6d4] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50" title="Export to JSON">
                      <Download className="w-3.5 h-3.5 text-[#06b6d4]" />
                      <span>{exportingTarget === 'json' ? 'Exporting...' : 'JSON'}</span>
                    </button>
                    <button disabled={!!exportingTarget} onClick={wrappedExportToMarkdown} className="bg-[var(--bg-tertiary)] hover:border-[#06b6d4] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50" title="Export to Markdown">
                      <FileText className="w-3.5 h-3.5 text-[#06b6d4]" />
                      <span>{exportingTarget === 'md' ? 'Exporting...' : 'MD'}</span>
                    </button>
                    <button disabled={!!exportingTarget} onClick={handleExportPDF} className="bg-[var(--bg-tertiary)] hover:border-[#06b6d4] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50" title="Export to PDF">
                      <BookOpen className="w-3.5 h-3.5 text-[#06b6d4]" />
                      <span>{exportingTarget === 'pdf' ? 'Exporting...' : 'PDF'}</span>
                    </button>
                  </>
                )}
                <Link to={`/graph/${documentId}`} className="bg-[var(--bg-tertiary)] hover:border-[#06b6d4] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all shadow-md">
                  <span>Knowledge Graph</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <button onClick={() => setPresentationMode(false)} className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all shadow-md">
                <X className="w-3.5 h-3.5" />
                <span>Exit Presentation</span>
              </button>
            )}
          </div>
        </div>

        {!roadmap ? (
          <div className="flex justify-center py-12">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-8 rounded-2xl w-full max-w-lg shadow-xl">
              <div className="flex flex-col items-center gap-4 mb-8 text-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-[#06b6d4]/20 to-[#3b82f6]/20 border border-[#06b6d4]/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-[#06b6d4]/20 rounded-full blur-xl"></motion.div>
                  <Compass className="w-10 h-10 text-[#06b6d4] relative z-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">🎓 Ready to begin?</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xs mx-auto leading-relaxed">
                    Generate your first learning journey. Choose a starting concept below to compile a structured curriculum.
                  </p>
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 text-[#06b6d4] animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleGeneratePath} className="flex flex-col gap-6">
                  <select
                    value={targetConcept}
                    onChange={(e) => setTargetConcept(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[#06b6d4] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none"
                  >
                    {concepts.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={generating || !targetConcept}
                    className="w-full bg-[#06b6d4] hover:bg-[#06b6d4]/90 disabled:bg-[var(--bg-tertiary)] text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Compiling Curriculum...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Start Learning Journey</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : generating ? (
          <motion.div 
            animate={{ opacity: [0.6, 1, 0.6] }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col gap-10"
          >
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-8 flex flex-col gap-6 shadow-md h-[180px]">
               <div className="w-1/4 h-4 bg-[var(--bg-tertiary)] rounded mb-2"></div>
               <div className="w-1/2 h-8 bg-[var(--bg-tertiary)] rounded"></div>
            </div>
            <div className="flex flex-col gap-12 w-full max-w-[900px] mx-auto">
               <div className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl"></div>
               <div className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl"></div>
               <div className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl"></div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10">
            {/* Header Redesign */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-8 flex flex-col gap-6 shadow-md relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#06b6d4] via-[#3b82f6] to-[#8b5cf6]"></div>
               <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                 <div>
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#06b6d4] block">Target Topic</span>
                     {isDemoMode && <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">DEMO MODE</span>}
                   </div>
                   <h1 className="text-4xl font-black text-[var(--text-primary)]">{roadmap.targetConcept}</h1>
                 </div>
                 
                 <div className="flex flex-wrap gap-6 lg:gap-12 mt-4 lg:mt-0">
                    {currentStageObj && (
                      <div className="border-l-4 border-[#06b6d4] pl-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] block mb-1">Current Stage</span>
                        <span className="text-sm font-bold text-[var(--text-primary)]">{currentStageObj.title}</span>
                        <span className="text-xs text-[var(--text-secondary)] block mt-0.5 font-medium">
                           Completed {currentStageObj.items.filter(i => completedSteps[i.step.concept]).length}/{currentStageObj.items.length} steps
                        </span>
                      </div>
                    )}
                    {nextStageObj && (
                      <div className="border-l-4 border-[var(--border-primary)] pl-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] block mb-1">Next Stage</span>
                        <span className="text-sm font-bold text-[var(--text-secondary)]">{nextStageObj.title}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981] block mb-1 flex items-center gap-1"><Star className="w-3 h-3"/> EXP</span>
                      <span className="text-xl font-bold text-[#10b981]">{currentXP} XP</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] block mb-1">Remaining Time</span>
                      <span className="text-xl font-bold text-[var(--text-primary)]">{remainingHours} hrs</span>
                    </div>
                 </div>
               </div>

               <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border-primary)] mt-2">
                 <div className="flex justify-between items-center text-sm">
                   <span className="font-bold text-[var(--text-secondary)]">Overall Progress</span>
                   <span className="font-black text-[var(--text-primary)]">{percentComplete}%</span>
                 </div>
                 <div className="w-full h-3 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-primary)]" role="progressbar" aria-valuenow={percentComplete} aria-valuemin="0" aria-valuemax="100">
                    <div className="h-full bg-[#06b6d4] rounded-full transition-all duration-1000" style={{ width: `${percentComplete}%` }}></div>
                 </div>
               </div>
            </div>

            {/* Main Curriculum Vertical Timeline */}
            <div className="flex flex-col gap-12 w-full max-w-[900px] mx-auto">
              {milestones.map((milestone, mIdx) => {
                const milestoneCompleted = milestone.items.every(m => completedSteps[m.step.concept]);
                return (
                  <div key={milestone.title} className="flex flex-col gap-8">
                    
                    <div className="flex items-center gap-4">
                      <div className="h-px bg-[var(--border-primary)] flex-1"></div>
                      <h2 className="text-sm font-black text-[var(--text-secondary)] tracking-[0.2em]">
                        {milestone.title}
                      </h2>
                      <div className="h-px bg-[var(--border-primary)] flex-1"></div>
                    </div>

                    {milestoneCompleted && milestone.items.length > 0 && (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring" }}
                        className="flex items-center justify-center w-full mt-[-10px] mb-2"
                      >
                        <div className="bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm shadow-[#10b981]/10 relative overflow-hidden">
                          <motion.div 
                            animate={{ x: [0, 100, 200, 300, 400] }} 
                            transition={{ duration: 1.5, repeat: Infinity }} 
                            className="absolute top-0 bottom-0 left-[-20%] w-[10%] bg-white/30 blur-sm transform -skew-x-12"
                          />
                          <Trophy className="w-5 h-5" />
                          <span>Achievement Unlocked: {milestone.title} Explorer</span>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex flex-col gap-10 relative">
                      {/* Central Timeline Line */}
                      <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-[var(--border-primary)] z-0"></div>
                      
                      {milestone.items.map((item, i) => (
                         <CurriculumCard
                           key={item.step.concept}
                           step={item.step}
                           idx={item.idx}
                           parsedGuide={parsedGuide[item.step.concept]}
                           isCompleted={completedSteps[item.step.concept]}
                           objectiveProgress={objectiveProgress}
                           graphEdges={graphEdges}
                           onToggleComplete={() => handleToggleComplete(item.step.concept, parsedGuide[item.step.concept]?.objectives || [])}
                           onToggleObjective={(objIdx) => handleToggleObjective(item.step.concept, objIdx, parsedGuide[item.step.concept]?.objectives || [])}
                         />
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Recommendations Panel */}
            {!presentationMode && (
              <div className="pt-8 border-t border-[var(--border-primary)] mt-8">
                <RecommendationPanel 
                  documentId={documentId} 
                  roadmap={roadmap} 
                  completedSteps={completedSteps} 
                  onSelectRecommendation={(concept) => {
                    setTargetConcept(concept);
                    window.scrollTo(0, 0);
                    handleGeneratePath({ preventDefault: () => {} });
                  }} 
                />
              </div>
            )}

          </motion.div>
        )}
      </div>
      <ConfirmModal 
        isOpen={!!undoModalStep} 
        onClose={() => setUndoModalStep(null)} 
        onConfirm={() => {
          if (undoModalStep) {
            applyCompletionToggle(undoModalStep.conceptName, undoModalStep.objectivesList, false);
            setUndoModalStep(null);
          }
        }}
        conceptName={undoModalStep?.conceptName}
      />
      {!presentationMode && <ToastContainer toasts={toasts} />}
    </AppShell>
  );
};

export default LearningPath;
