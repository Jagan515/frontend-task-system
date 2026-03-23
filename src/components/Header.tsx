import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { APP_ROUTES } from '../config/routes';
import { UserRoleLabels } from '../types/auth';
import './Header.css';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navItems = APP_ROUTES.filter(route => 
    route.label && 
    route.isProtected && 
    !route.hideInMenu && 
    (!route.permissions || (user && route.permissions.includes(user.role)))
  );

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <Link to="/" className="brand-logo">
            <span className="brand-dot"></span>
            <h2>{title || 'TaskCollaborate'}</h2>
          </Link>
        </div>
        
        {isAuthenticated && (
          <nav className="header-nav">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-profile">
              <div className="user-info-text">
                <span className="user-name">{user?.username || user?.email?.split('@')[0]}</span>
                <span className="user-role-badge">
                  {user ? UserRoleLabels[user.role] : ''}
                </span>
              </div>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <div className="guest-actions">
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/signup" className="signup-btn">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
