import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  isProtected: boolean;
  permissions?: string[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  isProtected, 
  permissions 
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isProtected) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permissions && user && !permissions.includes(user.role)) {
    // If authenticated but role not allowed, redirect to home (or an unauthorized page)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
