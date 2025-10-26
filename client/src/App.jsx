import { Routes, Route, Navigate } from 'react-router-dom'; // ត្រូវបន្ថែម Navigate
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AccessoryPage from './pages/AccessoryPage';
import ToolsPage from './pages/ToolsPage';
import ReportPage from './pages/ReportPage';
import SettingPage from './pages/SettingPage';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      
      {/* 1. Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Protected Routes - ប្រើ ProtectedRoute ដើម្បីការពារ */}
      <Route element={<ProtectedRoute />}>
        {/* ផ្លាស់ប្តូរ Root route ទៅជា Dashboard route វិញ */}
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/accessories" element={<MainLayout><AccessoryPage /></MainLayout>} />
        <Route path="/tools" element={<MainLayout><ToolsPage /></MainLayout>} />
        <Route path="/reports" element={<MainLayout><ReportPage /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><SettingPage /></MainLayout>} />
      </Route>

      {/* 3. Default Route: នៅពេលចូលដល់ URL មេ (/) នឹងបញ្ជូនទៅកាន់ /dashboard (ដែលនឹងត្រូវការពារដោយ ProtectedRoute) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 4. Catch-all for 404/Unknown URLs */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
