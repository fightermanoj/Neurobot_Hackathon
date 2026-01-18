import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/dashboard')}>
          <h2>🏭 Lakshmi Food Products</h2>
          <span className="navbar-subtitle">Production Visibility System</span>
        </div>
        <div className="navbar-right">
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