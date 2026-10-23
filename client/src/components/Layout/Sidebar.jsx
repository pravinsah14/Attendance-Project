import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useAuth } from '../../hooks/useAuth';
import {
  FiHome, FiClock, FiUsers, FiBarChart2, FiCheckSquare,
  FiAlertCircle, FiLogOut, FiMenu, FiX, FiSettings,
} from 'react-icons/fi';
import { MdOutlineTimer } from 'react-icons/md';

const navItems = {
  employee: [
    { to: '/employee/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/employee/punch', icon: FiClock, label: 'Punch In/Out' },
    { to: '/employee/overtime', icon: MdOutlineTimer, label: 'My Overtime' },
    { to: '/reports', icon: FiBarChart2, label: 'Reports' },
  ],
  manager: [
    { to: '/manager/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/reports', icon: FiBarChart2, label: 'Team Attendance' },
    { to: '/manager/overtime-approval', icon: MdOutlineTimer, label: 'Overtime Approvals' },
    { to: '/manager/validation', icon: FiCheckSquare, label: 'Validation' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/reports', icon: FiBarChart2, label: 'All Attendance' },
    { to: '/admin/users', icon: FiUsers, label: 'User Management' },
    { to: '/admin/overtime-approval', icon: MdOutlineTimer, label: 'Overtime Approvals' },
    { to: '/admin/validation', icon: FiCheckSquare, label: 'Validation' },
  ],
};

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { role, user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = navItems[role] || [];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 bg-gray-900 text-white flex flex-col transition-all duration-300
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700 min-h-[64px]">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiClock size={18} />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg whitespace-nowrap">AttendX</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-400 hover:text-white lg:hidden"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-700 p-4">
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 capitalize">{role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <FiLogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
