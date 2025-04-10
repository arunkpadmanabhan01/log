import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/parsing', label: 'Smart Parsing' },
    { path: '/filtering', label: 'Advanced Filtering' },
    { path: '/analytics', label: 'Visual Analytics' }
  ];

  return (
    <div className="navigation">
      <button 
        className="back-button"
        onClick={() => navigate('/')}
      >
        <span className="back-arrow">←</span>
        <span>Back</span>
      </button>
      <div className="nav-buttons">
        {navItems
          .filter(item => item.path !== currentPath)
          .map(item => (
            <button
              key={item.path}
              className="nav-button"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
      </div>
    </div>
  );
};

export default Navigation;
