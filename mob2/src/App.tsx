import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import OtpPage from './pages/OtpPage';
import Shell from './pages/Shell';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fff 0%, #FFF5F5 100%)', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontWeight: 900, fontSize: 18 }}>SN</span>
        </div>
        <div style={{ width: 32, height: 32, border: '3px solid #FEE2E2', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Shell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
