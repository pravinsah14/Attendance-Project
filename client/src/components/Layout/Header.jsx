import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { FiMenu, FiBell, FiLogOut, FiUser } from 'react-icons/fi';
import dayjs from 'dayjs';

const Header = ({ onMenuToggle }) => {
  const { user, role } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          <FiMenu size={22} />
        </button>
        <div>
          <p className="text-sm text-gray-500">{dayjs().format('dddd, MMMM D, YYYY')}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
          <FiBell size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
