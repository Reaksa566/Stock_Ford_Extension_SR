// client/src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBoxes, FaTools, FaFileAlt, FaUsersCog, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: FaTachometerAlt, path: '/' },
    { name: 'Accessory', icon: FaBoxes, path: '/accessories' },
    { name: 'Tools', icon: FaTools, path: '/tools' },
    { name: 'Report', icon: FaFileAlt, path: '/reports' },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'Setting', icon: FaUsersCog, path: '/settings' });
  }

  const getNavItemClass = (path) => 
    `flex items-center p-3 text-sm font-medium rounded-lg transition-all duration-200 ${
      location.pathname === path
        ? 'bg-ford-blue text-white shadow-md'
        : 'text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <aside
      className={`main-sidebar fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-30 shadow-xl scrollbar-thin ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo */}
      <div className="flex items-center justify-center p-4 h-16 bg-ford-blue text-white shadow-lg">
        <span className={`text-xl font-bold transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          Stock Ford Extension
        </span>
        <span className={`text-xl font-bold ${isCollapsed ? 'opacity-100 w-full' : 'opacity-0 w-0'}`}>
          SF
        </span>
      </div>

      {/* Sidebar Menu */}
      <div className="p-4 flex flex-col justify-between h-[calc(100vh-64px)]">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} to={item.path} className={getNavItemClass(item.path)}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`ml-3 transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* Footer/Logout */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex w-full items-center p-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-100 transition-colors duration-200"
          >
            <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
              Logout ({user?.username})
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;