import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GraphViewer from './pages/GraphViewer.jsx';
import ChatAssistant from './pages/ChatAssistant.jsx';
import LearningPath from './pages/LearningPath.jsx';

const App = () => {
  // Track active document ID to render Navbar sub-routes dynamically
  const [activeDocumentId, setActiveDocumentId] = useState(null);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<Dashboard setActiveDocumentId={setActiveDocumentId} activeDocumentId={activeDocumentId} />}
            />
            <Route
              path="/graph/:documentId"
              element={<GraphViewer />}
            />
            <Route
              path="/chat/:documentId"
              element={<ChatAssistant />}
            />
            <Route
              path="/learning-path/:documentId"
              element={<LearningPath />}
            />
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  </ErrorBoundary>
);
};

export default App;
