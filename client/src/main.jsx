import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// FIX: ផ្លាស់ប្តូរទៅប្រើ Relative Path សម្រាប់ការ Load CSS
import './index.css'; 
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; 

// Get the root element from public/index.html
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {/* BrowserRouter is essential for React Router to work */}
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
} else {
  console.error("Failed to find the root element in index.html");
}