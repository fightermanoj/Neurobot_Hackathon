import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Import API service
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [simLoading, setSimLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleRunSimulation = async () => {
      setSimLoading(true);
      try {
          await api.post('/simulator/run');
          alert('🚀 Simulation Started in Background!');
      } catch (error) {
          console.error("Failed to start simulation:", error);
          alert('Failed to start simulation');
      } finally {
          setSimLoading(false);
      }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/dashboard')}>
          <h2>🏭 Lakshmi Food Products</h2>
          <span className="navbar-subtitle">Production Visibility System</span>
        </div>
        <div className="navbar-right">
          <button 
            onClick={handleRunSimulation} 
            className="btn btn-warning" 
            style={{ marginRight: '10px', backgroundColor: '#e67e22', color: 'white' }}
            disabled={simLoading}
          >
            {simLoading ? 'Starting...' : '⚡ Run Simulator'}
          </button>
          <div className="user-info">
            <span className="user-name">{user?.full_name}</span>
            <span className={`user-role badge badge-${user?.role === 'owner' ? 'success' : user?.role === 'manager' ? 'info' : 'secondary'}`}>
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;