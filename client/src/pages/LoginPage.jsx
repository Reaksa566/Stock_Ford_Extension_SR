import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaUser } from 'react-icons/fa';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in (optional, but good practice)
  // const { user } = useAuth();
  // if (user) {
  //   navigate('/');
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please fill in both username and password.');
      setLoading(false);
      return;
    }

    // Call the login function from AuthContext
    const success = await login(username, password);

    if (success) {
      // Login successful, redirect to dashboard
      navigate('/', { replace: true });
    } else {
      // Login failed (handled by AuthContext, setting error message here is cleaner)
      setError('Invalid Username or Password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8">
        
        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-ford-blue mb-2">
          Stock Ford Extension
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Sign in to start your session
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 sr-only">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaUser className="h-5 w-5 text-gray-400" />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-ford-blue focus:border-ford-blue"
                placeholder="Username"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 sr-only">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="h-5 w-5 text-gray-400" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-ford-blue focus:border-ford-blue"
                placeholder="Password"
                disabled={loading}
              />
            </div>
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-ford-blue/70 cursor-not-allowed' : 'bg-ford-blue hover:bg-ford-blue/90'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ford-blue transition duration-150 ease-in-out`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Admin/User Note */}
        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
          <p>ដំបូងត្រូវបង្កើត Admin User ក្នុង Database ដោយដៃ:</p>
          <p className="font-semibold text-ford-blue mt-1">Username: reaksawelcome_db_user (Password: មិនមែន qK90tXhTalooCnGo ទេ)</p>
          <p className="font-semibold text-red-500">ប្រើ Password ដែលបានកំណត់ក្នុង Database</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;