import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-[var(--text-primary)]">
          <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-8 rounded-3xl flex flex-col items-center text-center gap-6 shadow-xl relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 shadow-sm relative z-10">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">⚠️ Something went wrong</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed font-medium">
                We couldn't load your curriculum correctly. This occasionally happens due to network issues or unexpected data. Don't worry, your progress is safe.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2 relative z-10">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
                className="flex-1 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
              <a
                href="/"
                className="flex-1 bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] font-bold py-3 rounded-xl border border-[var(--border-primary)] flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
