// src/App.jsx
import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ROLES } from './data/constants';
import { C } from './components/shared/UI';
import LoginPage from './components/auth/LoginPage';
import LandingPage from './components/LandingPage';
import Layout from './components/shared/Layout';
import BishopDashboard from './components/bishop/BishopDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import PastorDashboard from './components/pastor/PastorDashboard';
import DeptDashboard from './components/department/DeptDashboard';
import KDFDashboard from './components/kdf/KDFDashboard';

function AppContent() {
  const { profile, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.pageBg, fontFamily: 'system-ui' }}>
        <img src="/salem-logo.png" alt="Salem" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 20 }} />
        <div style={{ fontSize: 14, color: C.textSecondary, marginBottom: 16 }}>Loading SICC Admin...</div>
        <div style={{ width: 200, height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: C.gold, borderRadius: 2, animation: 'load 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }

  // Show landing page first (unless user clicked "Sign In" or is already authenticated)
  if (!isAuthenticated && !showLogin) {
    return <LandingPage onEnter={() => setShowLogin(true)} />;
  }

  if (!isAuthenticated) return <LoginPage />;

  const renderDashboard = () => {
    switch (profile?.role) {
      case ROLES.BISHOP:            return <BishopDashboard activeTab={activeTab} />;
      case ROLES.ADMIN:             return <AdminDashboard activeTab={activeTab} />;
      case ROLES.PASTOR:            return <PastorDashboard activeTab={activeTab} />;
      case ROLES.DEPARTMENT_LEADER: return <DeptDashboard activeTab={activeTab} />;
      case ROLES.KDF_COORDINATOR:   return <KDFDashboard activeTab={activeTab} />;
      default:
        return (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: C.danger, marginBottom: 8 }}>Role not recognised</div>
            <div style={{ fontSize: 13, color: C.textSecondary }}>
              Your profile role is <strong>{profile?.role || 'not set'}</strong>.<br />
              Please contact Admin to fix this.
            </div>
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderDashboard()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
