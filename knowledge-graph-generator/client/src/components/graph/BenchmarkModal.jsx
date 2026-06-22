import React, { useState } from 'react';
import axios from 'axios';
import { X, Play, Activity } from 'lucide-react';

const BenchmarkModal = ({ documentId, onClose }) => {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  const runBenchmarks = async () => {
    try {
      setRunning(true);
      const res = await axios.post(`/api/graph/${documentId}/benchmark`);
      if (res.data.success) {
        setResults(res.data.data.benchmarks);
      }
    } catch (err) {
      console.error('Benchmark failed', err);
      alert('Failed to run benchmarks');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Algorithm Benchmarks</h2>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-xs text-[var(--text-secondary)] mb-6">
            Run performance profiling on the current knowledge graph using native Graph Theory algorithms. This measures execution time in milliseconds.
          </p>
          
          <div className="flex flex-col gap-3 mb-6">
            {['BFS', 'DFS', 'Kahn', 'PageRank'].map((algo) => (
              <div key={algo} className="flex items-center justify-between bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-lg">
                <span className="text-xs font-bold text-[var(--text-primary)]">{algo}</span>
                <span className="text-xs font-mono text-cyan-400">
                  {results ? `${results[algo.toLowerCase()]} ms` : '-- ms'}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={runBenchmarks}
            disabled={running}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
          >
            {running ? (
              <span className="animate-pulse">Profiling Algorithms...</span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Benchmarks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkModal;
