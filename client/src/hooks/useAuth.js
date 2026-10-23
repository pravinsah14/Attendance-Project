import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const role = user?.role || null;

  const isEmployee = role === 'employee';
  const isManager = role === 'manager';
  const isAdmin = role === 'admin';
  const isManagerOrAdmin = isManager || isAdmin;

  return {
    user,
    token,
    isAuthenticated,
    role,
    isEmployee,
    isManager,
    isAdmin,
    isManagerOrAdmin,
  };
};
