import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { type UserRole } from '../types/auth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  isProtected: boolean;
  permissions?: UserRole[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  isProtected, 
  permissions 
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isProtected) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Force password reset if required
  if (user?.passwordResetRequired && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />;
  }

  if (permissions && user && !permissions.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
