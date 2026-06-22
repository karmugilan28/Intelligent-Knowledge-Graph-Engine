import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { KeyRound, Mail, AlertTriangle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Left Column (Desktop) */}
        <div className="hidden lg:flex flex-col p-16 bg-slate-900/20 border-r border-slate-900/80 max-w-md w-full relative overflow-hidden shrink-0">
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-600/5 glow-blob animate-mesh-drift"></div>
          <div className="flex-1 flex flex-col justify-center text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-wider mb-6 w-fit">
              <span>AI-Powered Learning</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-gradient-primary leading-tight">
              Turn Complex Textbooks into Interactive Concept Maps.
            </h2>
            <p className="text-slate-400 text-xs mt-4 leading-relaxed max-w-sm">
              Accelerate your comprehension path, identify prerequisite dependencies, and master linear learning steps dynamically.
            </p>

            {/* Small Metrics grid */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-900">
              <div>
                <span className="text-2xl font-extrabold text-indigo-400 block">1.2M+</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Concepts Indexed</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-purple-400 block">99.8%</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Accuracy</span>
              </div>
            </div>
          </div>

          {/* Client testimonial excerpt */}
          <div className="mt-auto relative z-10 pt-8 border-t border-slate-900/60">
            <p className="text-xs text-slate-450 italic leading-relaxed">
              "DFS path traversals help me spot sequence gaps instantly. I've halved my textbook study time."
            </p>
            <div className="flex items-center gap-2.5 mt-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center font-bold text-[9px] text-indigo-400">
                AR
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Alex Rivera, MIT Undergrad</span>
            </div>
          </div>
        </div>

        {/* Right Column (Form container) */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
          <div className="w-full max-w-md glass-premium p-8 rounded-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-center text-gradient-primary">Welcome Back</h2>
            <p className="text-xs text-slate-400 text-center mt-1">Sign in to manage your documents and explore graphs</p>

            {error && (
              <div className="mt-6 flex items-start gap-2.5 bg-red-950/40 border border-red-900/60 p-3 rounded-lg text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none transition-all placeholder-slate-600"
                    placeholder="name@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none transition-all placeholder-slate-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 rounded-lg border border-indigo-500/30 shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-all disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
