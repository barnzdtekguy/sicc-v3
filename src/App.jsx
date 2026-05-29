// src/App.jsx
import { useState, useEffect } from 'react';
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

// Pages in order
const PAGES = { LANDING: 'landing', LOGIN: 'login', DASHBOARD: 'dashboard' };

function AppContent() {
  const { profile, isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [page, setPage] = useState(PAGES.LANDING);

  // ── Push a browser history entry when navigating ──
  const navigate = (newPage) => {
    window.history.pushState({ page: newPage }, '', window.location.pathname);
    setPage(newPage);
  };

  // ── Listen for the back/forward button ──
  useEffect(() => {
    // Set initial history entry so there's always something to go back "to"
    window.history.replaceState({ page: PAGES.LANDING }, '', window.location.pathname);

    const onPopState = (e) => {
      const target = e.state?.page || PAGES.LANDING;
      // Don't let back button bypass authentication
      if (target === PAGES.DASHBOARD && !isAuthenticated) {
        setPage(PAGES.LOGIN);
      } else {
        setPage(target);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isAuthenticated]);

  // ── When user logs in successfully, push dashboard into history ──
  useEffect(() => {
    if (isAuthenticated) {
      window.history.pushState({ page: PAGES.DASHBOARD }, '', window.location.pathname);
      setPage(PAGES.DASHBOARD);
    }
  }, [isAuthenticated]);

  // ── Loading screen ──
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

  // ── Landing page ──
  if (page === PAGES.LANDING) {
    return <LandingPage onEnter={() => navigate(PAGES.LOGIN)} />;
  }

  // ── Login page ──
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ── Dashboard ──
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
