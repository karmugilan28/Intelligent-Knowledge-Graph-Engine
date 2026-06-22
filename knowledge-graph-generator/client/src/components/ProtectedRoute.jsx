import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col justify-center items-center">
        {/* Loading Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-400 font-medium text-sm tracking-wider animate-pulse">
          VERIFYING ACCESS...
        </p>
      </div>
    );
  }

  // Redirect to login if token is missing
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
