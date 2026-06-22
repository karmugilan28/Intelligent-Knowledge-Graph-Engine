import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';
import {
  Search,
  Network,
  Play,
  X,
  Database,
  RefreshCw,
  AlertTriangle,
  Activity
} from 'lucide-react';
import AppShell from '../components/AppShell.jsx';
import BenchmarkModal from '../components/graph/BenchmarkModal.jsx';

// --- TASK 2: VIBRANT, MULTI-COLOR NODE THEMING ---
const CustomSaaSNode = memo(({ data }) => {
  const diff = data.difficulty || 5;
  const isTraversed = data.isTraversed;
  const isMatch = data.isMatch;
  const isDimmed = data.isDimmed;

  let themeClass = 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'; // Foundational
  if (diff >= 4 && diff <= 7) themeClass = 'border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]'; // Intermediate
  if (diff >= 8) themeClass = 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'; // Advanced

  let bgClass = 'bg-zinc-900/90 backdrop-blur-md text-white';
  
  if (isTraversed || isMatch) {
    bgClass = 'bg-cyan-500 text-white font-bold scale-105 shadow-[0_0_20px_rgba(6,182,212,0.8)]';
    themeClass = 'border-cyan-300';
  }

  const opacityClass = isDimmed ? 'opacity-30' : 'opacity-100';

  return (
    <div className={`relative px-4 py-3 rounded-lg border-2 ${themeClass} ${bgClass} transition-all duration-300 cursor-pointer min-w-[160px] text-center ${opacityClass}`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-white border-none" />
      <div className="font-bold text-[13px] tracking-wide">{data.label}</div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-white border-none" />
    </div>
  );
});

const nodeTypes = {
  customNode: CustomSaaSNode,
};

const GraphViewerContent = () => {
  const { documentId } = useParams();
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeReferences, setNodeReferences] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('semantic'); 
  const [searching, setSearching] = useState(false);
  
  const [startNode, setStartNode] = useState('');
  const [traversalAlgo, setTraversalAlgo] = useState('bfs');
  const [animating, setAnimating] = useState(false);
  const [traversalHighlighted, setTraversalHighlighted] = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(false);

  // --- TASK 1: DAGRE LAYOUT ---
  const getLayoutedElements = (nodes, edges, direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 180, height: 40 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 180 / 2,
          y: nodeWithPosition.y - 40 / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  };

  const updateNodes = (nodesList, matchedNames = new Set(), traversedList = []) => {
    return nodesList.map(node => {
      const isMatch = matchedNames.has(node.id);
      const isTraversed = traversedList.includes(node.id);
      const isDimmed = (matchedNames.size > 0 && !isMatch) || (traversedList.length > 0 && !isTraversed);
      
      return {
        ...node,
        type: 'customNode',
        data: {
          ...node.data,
          isMatch,
          isTraversed,
          isDimmed
        }
      };
    });
  };

  const updateEdges = (edgesList, traversedList = []) => {
    return edgesList.map(edge => {
      // Highlight edge if both its source and target have been traversed
      const isTraversed = traversedList.includes(edge.source) && traversedList.includes(edge.target);
      const isDimmed = traversedList.length > 0 && !isTraversed;
      
      const strokeColor = isTraversed ? 'var(--brand-primary)' : (isDimmed ? 'var(--border-secondary)' : 'var(--text-tertiary)');

      return {
        ...edge,
        animated: true,
        style: {
          strokeWidth: isTraversed ? 4 : 2,
          stroke: strokeColor,
          opacity: isDimmed ? 0.2 : 1,
          transition: 'all 0.3s ease',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: strokeColor,
        },
      };
    });
  };

  const loadGraph = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/graph/${documentId}`);
      if (response.data.success) {
        const { graph } = response.data.data;
        
        const styledEdges = updateEdges(graph.edges);
        const styledNodes = updateNodes(graph.nodes);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(styledNodes, styledEdges, 'LR');
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setTraversalHighlighted(false);
        
        setTimeout(() => {
          fitView({ padding: 0.2, duration: 800 });
        }, 50);
        
        if (graph.nodes.length > 0) {
          setStartNode(graph.nodes[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load graph:', err.message);
      setError(err.response?.data?.message || 'Failed to load graph.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, [documentId]);

  // --- TASK 3: RESTORE THE CONCEPT INSPECTOR ---
  const onNodeClick = useCallback(async (event, node) => {
    setSelectedNode(node.data);
    setNodeReferences([]);
    setLoadingRefs(true);
    
    fitView({
      nodes: [{ id: node.id }],
      duration: 800,
      minZoom: 1.2,
      maxZoom: 1.5,
    });
    
    try {
      const response = await axios.get(`/api/graph/${documentId}/references/${encodeURIComponent(node.id)}`);
      if (response.data.success) {
        setNodeReferences(response.data.data.references);
      }
    } catch (err) {
      console.error('Failed to load concept references:', err.message);
    } finally {
      setLoadingRefs(false);
    }
  }, [documentId, fitView]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadGraph();
      return;
    }

    try {
      setSearching(true);
      const response = await axios.get(
        `/api/search?documentId=${documentId}&query=${encodeURIComponent(searchQuery)}&type=${searchType}`
      );
      
      if (response.data.success) {
        const matchingConcepts = response.data.data.results;
        setTraversalHighlighted(false);
        const matchedNames = new Set(matchingConcepts.map(c => c.name));

        setNodes((nds) => updateNodes(nds, matchedNames, []));
        setEdges((eds) => updateEdges(eds, []));

        if (matchingConcepts.length > 0) {
          fitView({
            nodes: [{ id: matchingConcepts[0].name }],
            duration: 800,
            minZoom: 1.2,
            maxZoom: 1.5,
          });
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Search failed:', err.message);
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    loadGraph();
  };

  // --- TASK 4: RESTORE BFS VISUAL TRAVERSAL ANIMATION ---
  const handleRunTraversal = async () => {
    if (traversalHighlighted) {
      loadGraph();
      return;
    }

    if (!startNode || animating || !traversalAlgo) return;

    try {
      setAnimating(true);
      const response = await axios.get(
        `/api/graph/${documentId}/${traversalAlgo}?startNode=${encodeURIComponent(startNode)}`
      );

      if (response.data.success) {
        const { sequence } = response.data.data;
        
        setNodes((nds) => updateNodes(nds, new Set(), [])); // dim all
        setEdges((eds) => updateEdges(eds, []));

        const traversed = [];
        for (let idx = 0; idx < sequence.length; idx++) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          const currentConcept = sequence[idx];
          traversed.push(currentConcept);

          setNodes((nds) => updateNodes(nds, new Set(), traversed));
          setEdges((eds) => updateEdges(eds, traversed));
        }
        setTraversalHighlighted(true);
        
        // Re-center graph to ensure it's beautifully framed after animation
        setTimeout(() => {
          fitView({ padding: 0.2, duration: 800 });
        }, 50);
      }
    } catch (err) {
      console.error('Traversal failed:', err.message);
    } finally {
      setAnimating(false);
    }
  };

  return (
    <div className="flex-1 flex relative w-full h-[calc(100vh-64px)] md:h-screen bg-[var(--bg-primary)]">
      {/* Left Area: Graph Canvas & Floating Panels */}
      <div className="flex-1 relative h-full">
        
        {/* Floating Controls Overlay */}
        <div className="absolute top-6 left-6 z-10 w-80 flex flex-col gap-4 pointer-events-none">
          
          {/* Search Panel */}
          <form onSubmit={handleSearch} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-4 rounded-xl flex flex-col gap-3 pointer-events-auto shadow-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-cyan-500 focus:outline-none rounded-md py-1.5 pl-9 pr-3 text-xs text-[var(--text-primary)]"
                  placeholder="Search concepts..."
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <Search className="w-3.5 h-3.5" />
                </div>
              </div>
              <button
                type="submit"
                disabled={searching}
                className="bg-[var(--brand-primary)] border border-[var(--brand-primary)] text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-[var(--brand-secondary)] hover:border-[var(--brand-secondary)] transition-colors cursor-pointer shadow-sm"
              >
                Search
              </button>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] border-t border-[var(--border-primary)] pt-3">
              <span className="font-bold tracking-wider">ENGINE:</span>
              <div className="flex gap-3">
                {['exact', 'fuzzy', 'semantic'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSearchType(type)}
                    className={`font-bold uppercase tracking-wider ${searchType === type ? 'text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded' : 'hover:text-[var(--text-primary)]'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Traversal Panel */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-4 rounded-xl flex flex-col gap-3 pointer-events-auto shadow-2xl">
            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">VISUAL TRAVERSAL DSA</h3>
            <div className="flex gap-2 text-xs">
              <select
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                disabled={animating}
                className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none rounded-md px-2 py-1.5"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>{n.id}</option>
                ))}
              </select>
              
              <div className="flex bg-[var(--bg-primary)] rounded-md border border-[var(--border-primary)] p-0.5 overflow-hidden">
                <button
                  onClick={() => setTraversalAlgo('bfs')}
                  disabled={animating}
                  className={`px-3 py-1 text-[10px] font-bold ${traversalAlgo === 'bfs' ? 'bg-cyan-400 text-black rounded-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  BFS
                </button>
                <button
                  onClick={() => setTraversalAlgo('dfs')}
                  disabled={animating}
                  className={`px-3 py-1 text-[10px] font-bold ${traversalAlgo === 'dfs' ? 'bg-cyan-400 text-black rounded-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  DFS
                </button>
              </div>
            </div>
            
            <button
              onClick={handleRunTraversal}
              disabled={animating || nodes.length === 0}
              className="w-full mt-1 bg-[var(--brand-primary)] border border-[var(--brand-primary)] text-white font-bold py-2 rounded-md text-xs flex items-center justify-center gap-2 hover:bg-[var(--brand-secondary)] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {animating ? 'Traversing graph...' : traversalHighlighted ? 'Clear Highlight' : 'Animate Path'}
            </button>

            {/* Benchmark Tools */}
            <div className="mt-2 pt-3 border-t border-[var(--border-primary)]">
              <button
                onClick={() => setShowBenchmark(true)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-cyan-400 hover:border-cyan-400 font-bold py-1.5 rounded-md text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                Benchmark Algorithms
              </button>
            </div>
          </div>
        </div>

        {/* React Flow Area */}
        {loading ? (
          <div className="w-full h-full flex flex-col justify-center items-center">
            <RefreshCw className="w-8 h-8 text-[var(--text-secondary)] animate-spin mb-4" />
            <p className="text-[var(--text-secondary)] font-medium">Loading Graph...</p>
          </div>
        ) : error ? (
          <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 rounded-xl max-w-md text-center shadow-2xl">
              <AlertTriangle className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Graph Not Ready</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">{error}</p>
              <Link to="/dashboard" className="bg-cyan-950/30 border border-cyan-800 text-cyan-400 px-4 py-2 rounded-md text-sm font-bold hover:bg-cyan-900/40 transition-colors inline-block cursor-pointer">
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full min-h-[600px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              style={{ width: '100%', height: '100%' }}
            >
              <Background color="var(--text-tertiary)" gap={16} size={1} />
              <Controls showInteractive={false} style={{ bottom: '20px', left: '20px' }} />
            </ReactFlow>
          </div>
        )}
      </div>

      {/* Right Sidebar: Concept Inspector */}
      <div className="w-80 bg-[var(--bg-primary)] border-l border-[var(--border-primary)] flex flex-col h-full overflow-y-auto">
        {!selectedNode ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
            <Network className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Concept Inspector</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Click any node on the graph to display its explainability metadata, difficulty score, and source paragraphs.</p>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start border-b border-[var(--border-primary)] pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-500 mb-1 block">
                  {selectedNode.category || 'Concept'}
                </span>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedNode.label}</h2>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-around gap-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-4 rounded-xl shadow-sm">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Difficulty</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--bg-primary)" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * (selectedNode.difficulty || 5)) / 10} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-xs font-bold text-[var(--text-primary)]">{selectedNode.difficulty || 5}/10</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Importance</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--bg-primary)" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * (selectedNode.importance || 5)) / 10} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-xs font-bold text-[var(--text-primary)]">{selectedNode.importance || 5}/10</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Description</span>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-4 rounded-xl shadow-sm">
                {selectedNode.description}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2 mb-3">
                <Database className="w-3.5 h-3.5 text-cyan-500" />
                Source Citations ({nodeReferences.length})
              </span>
              
              {loadingRefs ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="w-4 h-4 text-cyan-500 animate-spin" />
                </div>
              ) : nodeReferences.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] italic">No source mapping available.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {nodeReferences.map((ref, idx) => (
                    <div key={ref._id} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-3 py-2 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Source Block #{idx + 1}</span>
                        <Database className="w-3 h-3 text-[var(--text-tertiary)]" />
                      </div>
                      <p className="p-3 text-xs text-[var(--text-secondary)] italic whitespace-pre-wrap leading-relaxed">
                        {ref.sourceSnippet === selectedNode.label 
                          ? ref.surroundingContext 
                          : (ref.sourceSnippet || ref.surroundingContext || "Context unavailable")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {showBenchmark && (
        <BenchmarkModal 
          documentId={documentId} 
          onClose={() => setShowBenchmark(false)} 
        />
      )}
    </div>
  );
};

const GraphViewer = () => {
  const { documentId } = useParams();
  return (
    <AppShell activeDocumentId={documentId}>
      <ReactFlowProvider>
        <GraphViewerContent />
      </ReactFlowProvider>
    </AppShell>
  );
};

export default GraphViewer;
