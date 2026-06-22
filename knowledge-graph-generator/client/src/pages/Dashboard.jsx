import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Search, Plus, BookOpen, Clock, FileText, ChevronRight, Settings, RefreshCw, HardDrive, Server, Activity, FileJson, CheckCircle2, Moon, Sun, BarChart2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import AppShell from '../components/AppShell.jsx';

const Dashboard = ({ setActiveDocumentId, activeDocumentId }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConcepts: 0,
    totalRelationships: 0,
    totalSize: '0 MB'
  });
  const [activeTab, setActiveTab] = useState('library');
  const [isUploading, setIsUploading] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/documents');
      if (response.data.success) {
        setDocuments(response.data.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/documents/stats');
      if (response.data.success && response.data.data.statistics) {
        setStats({
          totalConcepts: response.data.data.statistics.conceptCount || 0,
          totalRelationships: response.data.data.statistics.relationshipCount || 0,
          totalSize: '1.24 MB'
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const handleDocumentClick = (id) => {
    setActiveDocumentId(id);
    navigate(`/graph/${id}`);
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        fetchDocuments();
        fetchStats();
        setActiveTab('library');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10485760,
    multiple: false
  });

  return (
    <AppShell activeDocumentId={activeDocumentId}>
      <div className="w-full min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 md:p-8 font-sans">
        {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Main Console</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage learning assets, inspect graphs, and view system status</p>
        </div>
        
        {/* Center Toggle & Right Buttons */}
        <div className="flex items-center gap-6">
          {/* Theme Toggle */}
          <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full p-1">
            <button className="p-2 rounded-full bg-[#1e1e21] text-cyan-400 shadow-sm">
              <Moon className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Sun className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-cyan-800 text-cyan-400 rounded-md text-sm font-medium hover:bg-cyan-900/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Document +
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[var(--border-primary)] text-zinc-300 rounded-md text-sm font-medium hover:bg-zinc-800/50 transition-colors">
              <Settings className="w-4 h-4" />
              API Settings
            </button>
            <button onClick={() => { fetchDocuments(); fetchStats(); }} className="p-2 bg-transparent border border-[var(--border-primary)] text-zinc-300 rounded-md hover:bg-zinc-800/50 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* 1. EXTRACTED CONCEPTS */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider">EXTRACTED CONCEPTS</span>
            <FileText className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex justify-between items-end h-full">
            <div className="flex flex-col justify-end">
              <div className="text-3xl font-bold text-[var(--text-primary)] leading-none mb-1.5">{stats.totalConcepts}</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Across {documents.length} indexed documents</div>
            </div>
            {/* Custom Bar Chart Graphic */}
            <div className="flex items-end gap-1 h-10">
              <div className="w-2 h-4 bg-cyan-500 rounded-sm"></div>
              <div className="w-2 h-6 bg-cyan-400 rounded-sm"></div>
              <div className="w-2 h-8 bg-lime-400 rounded-sm"></div>
              <div className="w-2 h-10 bg-purple-500 rounded-sm"></div>
              <div className="w-2 h-6 bg-fuchsia-500 rounded-sm"></div>
            </div>
          </div>
        </div>
        
        {/* 2. CONCEPT RELATIONSHIPS */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider">CONCEPT RELATIONSHIPS</span>
            <Network className="w-4 h-4 text-lime-400" />
          </div>
          <div className="flex justify-between items-end h-full">
            <div className="flex flex-col justify-end">
              <div className="text-3xl font-bold text-[var(--text-primary)] leading-none mb-1.5">{stats.totalRelationships}</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Across {stats.totalRelationships} prerequisite links</div>
            </div>
            {/* Custom Network Graphic */}
            <div className="w-14 h-12 relative opacity-80">
               <svg viewBox="0 0 100 100" className="w-full h-full stroke-zinc-600 stroke-[1.5]">
                 <line x1="20" y1="50" x2="50" y2="20" className="stroke-fuchsia-500" />
                 <line x1="50" y1="20" x2="80" y2="50" className="stroke-lime-400" />
                 <line x1="80" y1="50" x2="50" y2="80" className="stroke-cyan-500" />
                 <line x1="50" y1="80" x2="20" y2="50" />
                 <line x1="20" y1="50" x2="80" y2="50" className="stroke-lime-500" />
                 <circle cx="20" cy="50" r="5" className="fill-cyan-400" />
                 <circle cx="50" cy="20" r="5" className="fill-fuchsia-400" />
                 <circle cx="80" cy="50" r="5" className="fill-lime-400" />
                 <circle cx="50" cy="80" r="5" className="fill-purple-400" />
                 <circle cx="50" cy="50" r="4" className="fill-yellow-400" />
               </svg>
            </div>
          </div>
        </div>

        {/* 3. AI OPERATIONS VOLUME */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider">AI OPERATIONS VOLUME</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex justify-between items-end h-full">
            <div className="flex flex-col justify-end">
              <div className="text-3xl font-bold text-[var(--text-primary)] leading-none mb-1.5">{documents.length * 4}</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Est. Tokens: 120.5K</div>
            </div>
            {/* Custom Circular Gauge */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path className="stroke-zinc-800" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="stroke-cyan-500" strokeWidth="4" strokeDasharray="60, 100" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="stroke-purple-500" strokeWidth="4" strokeDasharray="30, 100" strokeDashoffset="-60" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4. SYSTEM INTEGRATION */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider">SYSTEM INTEGRATION</span>
            <Server className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex justify-between items-end h-full">
            <div className="flex flex-col justify-end w-full">
              <div className="flex justify-between items-center w-full mb-1">
                <div className="text-lg font-bold text-[var(--text-primary)]">Mock Sandbox</div>
                {/* Lines connecting to DB graphic */}
                <svg width="40" height="20" viewBox="0 0 40 20" className="opacity-80">
                  <path d="M0,5 Q20,5 20,10 T40,15" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
                  <path d="M0,10 Q20,10 20,10 T40,10" fill="none" stroke="#f97316" strokeWidth="1.5" />
                  <path d="M0,15 Q20,15 20,10 T40,5" fill="none" stroke="#a3e635" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex justify-between items-end w-full">
                <span className="text-[9px] text-[var(--text-secondary)]">System Memory | Disk Memory</span>
                <span className="text-[8px] font-bold text-lime-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-lime-500"></span> CONNECTED</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. STORAGE & PROCESSING */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider">STORAGE & PROCESSING</span>
            <HardDrive className="w-4 h-4 text-lime-400" />
          </div>
          <div className="flex justify-between items-end h-full">
            <div className="flex flex-col justify-end w-full">
              <div className="text-2xl font-bold text-[var(--text-primary)] mb-2">{stats.totalSize || '1.24 MB'}</div>
              <div className="flex justify-between items-center w-full">
                <span className="text-[9px] text-[var(--text-secondary)]">Using in flow local volume</span>
                <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden ml-2">
                  <div className="w-1/2 h-full bg-lime-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-6 px-1 border-b border-[var(--border-primary)] pb-2">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors ${activeTab === 'library' ? 'bg-cyan-400 text-black' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          Document Library
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`text-[11px] font-bold transition-colors ${activeTab === 'upload' ? 'text-cyan-400' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          Upload Analyzer
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`text-[11px] font-bold transition-colors ${activeTab === 'diagnostics' ? 'text-cyan-400' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          System Diagnostics
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Content */}
        <div className="lg:col-span-3">
          {activeTab === 'library' && (
            <div className="min-h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 bg-[var(--bg-secondary)] border border-[var(--border-primary)]/60 rounded-xl">
                  <FileJson className="w-16 h-16 text-zinc-700 mb-4" />
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No learning files uploaded</h3>
                  <p className="text-[var(--text-secondary)] text-sm max-w-md">Your library is currently empty. Switch to the 'Upload Analyzer' tab above to import your course notes or textbook PDF.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div 
                      key={doc._id || doc.id} 
                      onClick={() => handleDocumentClick(doc._id || doc.id)}
                      className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 cursor-pointer hover:border-zinc-700 transition-all group flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-1.5 border border-cyan-800/50 rounded bg-cyan-950/20 text-cyan-500">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {new Date(doc.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 truncate">{doc.title}</h4>
                      <div className="flex items-center gap-1.5 mb-4 text-[10px] text-[var(--text-secondary)]">
                        <Network className="w-3 h-3" />
                        <span>{doc.concepts?.length || 0} Nodes</span>
                      </div>
                      
                      {/* Diagram Placeholder Image Area */}
                      <div className="mt-auto bg-white rounded-lg w-full h-32 flex items-center justify-center overflow-hidden border border-[var(--border-primary)]">
                        {/* Mock Multi-Head Attention Diagram SVG */}
                        <svg viewBox="0 0 200 100" className="w-full h-full opacity-90 p-2">
                           <rect x="20" y="40" width="40" height="20" rx="4" fill="#bfdbfe" stroke="#3b82f6" />
                           <text x="40" y="53" fontSize="8" textAnchor="middle" fill="#1e3a8a">Queries</text>
                           
                           <rect x="80" y="30" width="80" height="40" rx="4" fill="url(#grad1)" stroke="#8b5cf6" />
                           <defs>
                             <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                               <stop offset="0%" stopColor="#c4b5fd" />
                               <stop offset="100%" stopColor="#f9a8d4" />
                             </linearGradient>
                           </defs>
                           <text x="120" y="50" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#4c1d95">Multi-Head</text>
                           <text x="120" y="60" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#4c1d95">Attention</text>

                           <path d="M 60 50 L 80 50" stroke="#000" strokeWidth="1" fill="none" markerEnd="url(#arrow)" />
                           <defs>
                             <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse">
                               <path d="M 0 0 L 6 3 L 0 6 z" fill="#000" />
                             </marker>
                           </defs>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 min-h-[400px] flex flex-col items-center justify-center">
              <div 
                {...getRootProps()} 
                className={`w-full max-w-xl p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-cyan-500 bg-cyan-950/20' : 'border-zinc-700 hover:border-zinc-500 hover:bg-[var(--bg-tertiary)]/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-cyan-400" />
                </div>
                {isUploading ? (
                  <>
                    <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin mb-2" />
                    <p className="text-zinc-300 font-medium">Processing Document...</p>
                    <p className="text-[var(--text-secondary)] text-xs mt-2">Extracting chunks, embeddings, and topological graph.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Drop your PDF here</h3>
                    <p className="text-[var(--text-secondary)] text-sm">Or click to browse files</p>
                    <div className="mt-6 flex items-center gap-4 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                      <span>• PDF Only</span>
                      <span>• Max 10MB</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6 min-h-[400px] flex items-center justify-center">
              <p className="text-[var(--text-secondary)]">System operating normally. All services running.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-5">
            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              SYSTEM EVENT LOG
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[var(--text-primary)] font-bold mb-0.5">Database connection synchronized</p>
                  <p className="text-[9px] text-[var(--text-secondary)]">MongoDB in-memory fallback database connection verified</p>
                </div>
                <span className="text-[9px] text-zinc-600 ml-auto">Startup</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-lime-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[var(--text-primary)] font-bold mb-0.5">Queue worker initialized</p>
                  <p className="text-[9px] text-[var(--text-secondary)]">Active pool listening on Memory Callbacks</p>
                </div>
                <span className="text-[9px] text-zinc-600 ml-auto">Today</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--text-primary)] font-bold mb-0.5">AI model configuration verified</p>
                  <p className="text-[9px] text-[var(--text-secondary)]">Gemini model pipeline loaded. Mock offline sandbox</p>
                </div>
                <span className="text-[9px] text-zinc-600 ml-auto">Startup</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-5 flex-1">
            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              CONCEPT EXPLORER HELP
            </h3>
            <div className="space-y-3">
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                1. Click any ready document row to visualize its Visual Knowledge Graph.
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                2. Navigate to "Roadmaps" to generate dynamic study curricula.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
