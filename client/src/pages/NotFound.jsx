import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
    <div className="text-center">
      <FiAlertTriangle className="text-yellow-400 mx-auto mb-4" size={64} />
      <h1 className="text-6xl font-black text-gray-200 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <FiHome size={16} />
        Go Home
      </Link>
    </div>
  </div>
);

export default NotFound;
