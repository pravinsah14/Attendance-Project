import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const roleRedirects = {
  employee: '/employee/dashboard',
  manager: '/manager/dashboard',
  admin: '/admin/dashboard',
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role)) {
    const redirect = roleRedirects[role] || '/login';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default RoleRoute;
