// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading spinner or screen while checking auth status
    return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
  }

  // If user is authenticated, render child routes (Outlet), otherwise redirect to login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;