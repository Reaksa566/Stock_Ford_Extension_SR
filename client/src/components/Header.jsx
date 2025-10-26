// client/src/components/Header.jsx
import React from 'react';
import { FaBars, FaSearch, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  
  return (
    <header className="fixed top-0 right-0 z-20 h-16 bg-white shadow-lg border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4">
        
        {/* Left Side: Collapse Button */}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors duration-200"
        >
          <FaBars className="w-5 h-5" />
        </button>

        {/* Center: Search Bar (AdminLTE Style) */}
        <div className="flex-grow max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ford-blue focus:border-ford-blue"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Right Side: User Info */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <FaUserCircle className="w-8 h-8 text-ford-blue" />
        </div>
      </div>
    </header>
  );
};

export default Header;