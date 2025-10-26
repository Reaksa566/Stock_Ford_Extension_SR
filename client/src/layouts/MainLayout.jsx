// client/src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const contentMargin = isCollapsed ? 'ml-20' : 'ml-64';

  return (
    <div className="flex min-h-screen bg-ford-light">
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
      />
      
      <div className={`content-wrapper flex-1 ${contentMargin} transition-all duration-300 pt-16`}>
        <Header toggleSidebar={toggleSidebar} />
        
        {/* Main Content Area */}
        <main className="p-6">
          {children}
        </main>

        {/* Footer (Optional, can be added here) */}
        <footer className="main-footer p-4 text-center text-sm text-gray-500 border-t border-gray-200 mt-auto">
          Stock Ford Extension | Version 1.0.0
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;