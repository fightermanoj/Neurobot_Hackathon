import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'owner', 'manager'] },
    { path: '/production-flow', label: 'Production Flow', icon: '🔄', roles: ['admin', 'owner', 'manager'] },
    { path: '/worker-tracking', label: 'Worker Tracking', icon: '👷', roles: ['admin', 'owner', 'manager'] },
    { path: '/analytics', label: 'Analytics', icon: '📈', roles: ['admin', 'owner', 'manager'] },
    { path: '/users', label: 'User Management', icon: '👥', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;