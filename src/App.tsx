import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Sensors from './pages/Dashboard';
import Gateways from './pages/Gateways';
import Linking from './pages/Linking';
import Graphs from './pages/Graphs';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register/index';
import SignUp from './pages/SignUp';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CookieProvider } from './context/CookieContext';
import CookieBanner from './components/cookies/CookieBanner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoutes = () => (
  <ProtectedRoute>
    <Layout>
      <Routes>
        <Route path="/sensors" element={<Sensors />} />
        <Route path="/gateways" element={<Gateways />} />
        <Route path="/linking" element={<Linking />} />
        <Route path="/graphs" element={<Graphs />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
        <Route index element={<Navigate to="/sensors" replace />} />
      </Routes>
    </Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <CookieProvider>
        <Router>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
          <CookieBanner />
        </Router>
      </CookieProvider>
    </AuthProvider>
  );
}

export default App;
