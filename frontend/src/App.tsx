import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import NewPatientPage from './pages/NewPatientPage';
import PatientDetailPage from './pages/PatientDetailPage';
import ConditionPage from './pages/ConditionPage';
import FamilyPortalPage from './pages/FamilyPortalPage';
import CapacityPage from './pages/CapacityPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import type { User } from './types';

function ProtectedRoute({ user, children }: { user: User | null; children: React.ReactNode }) {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, setUser, loading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const activeUser = user ?? currentUser;

  function handleLogin(u: User) {
    setCurrentUser(u);
    setUser(u);
  }

  function handleLogout() {
    setCurrentUser(null);
    setUser(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
          <Route path="/auth/callback" element={<AuthCallbackPage onLogin={handleLogin} />} />
          <Route path="/conditions/:slug" element={<ConditionPage />} />
          <Route path="/portal/:token" element={<FamilyPortalPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute user={activeUser}>
              <Layout user={activeUser!} onLogout={handleLogout}>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute user={activeUser}>
              <Layout user={activeUser!} onLogout={handleLogout}>
                <PatientsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/patients/new" element={
            <ProtectedRoute user={activeUser}>
              <Layout user={activeUser!} onLogout={handleLogout}>
                <NewPatientPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/patients/:patientId" element={
            <ProtectedRoute user={activeUser}>
              <Layout user={activeUser!} onLogout={handleLogout}>
                <PatientDetailPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/capacity" element={
            <ProtectedRoute user={activeUser}>
              <Layout user={activeUser!} onLogout={handleLogout}>
                <CapacityPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
