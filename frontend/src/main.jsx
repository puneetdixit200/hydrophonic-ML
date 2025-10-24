import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InputDashboard from './pages/InputDashboard';
import ResultsView from './pages/ResultsView';

/**
 * Main App Component with routing
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InputDashboard />} />
        <Route path="/results" element={<ResultsView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Render app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
