import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OwnerDashboard from './pages/OwnerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ProductionFlow from './pages/ProductionFlow';
import WorkerTracking from './pages/WorkerTracking';
import Analytics from './pages/Analytics';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="spinner"></div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Dashboard Layout
const DashboardLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-container">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

// Dashboard Router based on role
const Dashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === 'owner' || user?.role === 'admin') {
    return <OwnerDashboard />;
  } else if (user?.role === 'manager') {
    return <ManagerDashboard />;
  }
  
  return <div>Unauthorized</div>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/production-flow" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProductionFlow />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/worker-tracking" element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkerTracking />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;