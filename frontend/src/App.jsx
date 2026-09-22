import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import RoomsPage from './pages/RoomsPage';
import StudentsPage from './pages/StudentsPage';
import AllocationsPage from './pages/AllocationsPage';
import PaymentsPage from './pages/PaymentsPage';
import StudentPaymentsPage from './pages/StudentPaymentsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import VisitorsPage from './pages/VisitorsPage';
import AttendancePage from './pages/AttendancePage';
import MyRoomPage from './pages/MyRoomPage';
import DbmsShowcasePage from './pages/DbmsShowcasePage';

// Root redirector based on authenticated user's role
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Routes inside Shell Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Admin Specific */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/allocations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AllocationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />

            {/* Student Specific */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-room"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyRoomPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-payments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentPaymentsPage />
                </ProtectedRoute>
              }
            />

            {/* Shared Roles (Admin & Student) */}
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/visitors" element={<VisitorsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/dbms-showcase" element={<DbmsShowcasePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
