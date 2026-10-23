import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout/Layout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Employee
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import PunchPage from './pages/employee/PunchPage';
import MyOvertime from './pages/employee/MyOvertime';

// Manager
import ManagerDashboard from './pages/manager/ManagerDashboard';
import OvertimeApproval from './pages/manager/OvertimeApproval';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

// Shared
import AttendanceReport from './pages/shared/AttendanceReport';
import AttendanceValidation from './pages/shared/AttendanceValidation';

// Other
import NotFound from './pages/NotFound';

const RoleRedirect = () => {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Root Redirect */}
      <Route path="/" element={<RoleRedirect />} />

      {/* Protected Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Employee Routes */}
        <Route
          path="/employee/dashboard"
          element={
            <RoleRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/employee/punch"
          element={
            <RoleRoute allowedRoles={['employee']}>
              <PunchPage />
            </RoleRoute>
          }
        />
        <Route
          path="/employee/overtime"
          element={
            <RoleRoute allowedRoles={['employee']}>
              <MyOvertime />
            </RoleRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager/dashboard"
          element={
            <RoleRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/manager/overtime-approval"
          element={
            <RoleRoute allowedRoles={['manager', 'admin']}>
              <OvertimeApproval />
            </RoleRoute>
          }
        />
        <Route
          path="/manager/validation"
          element={
            <RoleRoute allowedRoles={['manager', 'admin']}>
              <AttendanceValidation />
            </RoleRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <UserManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/overtime-approval"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <OvertimeApproval />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/validation"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AttendanceValidation />
            </RoleRoute>
          }
        />

        {/* Shared Routes */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AttendanceReport />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
