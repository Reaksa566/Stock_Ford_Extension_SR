// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Set base URL for API (for local development)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    if (token && role && username) {
      setUser({ token, role, username });
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      
      const { token, role, user: userData } = res.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', userData.username);

      setUser({ token, role, username: userData.username });
      return true;
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);