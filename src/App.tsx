import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-900 text-dark-100">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1F2937',
                color: '#F9FAFB',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#00FFE0',
                  secondary: '#1F2937',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#1F2937',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;