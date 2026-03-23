import React from 'react';
import { Dashboard } from '../pages/Dashboard';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { AuditLogPage } from '../pages/AuditLogPage';
import { TasksPage } from '../pages/TasksPage';
import { UsersPage } from '../pages/UsersPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { UserRole } from '../types/auth';

export interface RouteConfig {
  path: string;
  element: React.FC;
  label?: string;
  isProtected: boolean;
  permissions?: UserRole[];   // Use enum for permissions
  hideInMenu?: boolean;
}

export const APP_ROUTES: RouteConfig[] = [
  {
    path: '/login',
    element: LoginPage,
    isProtected: false,
    hideInMenu: true,
  },
  {
    path: '/signup',
    element: SignupPage,
    isProtected: false,
    hideInMenu: true,
  },
  {
    path: '/reset-password',
    element: ResetPasswordPage,
    isProtected: true,
    permissions: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
    hideInMenu: true,
  },
  {
    path: '/',
    element: Dashboard,
    label: 'Dashboard',
    isProtected: true,
    permissions: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    path: '/tasks',
    element: TasksPage,
    label: 'Tasks',
    isProtected: true,
    permissions: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    path: '/tasks/create',
    element: Dashboard, // Dummy element, not used as a page anymore
    label: 'Create Task',
    isProtected: true,
    permissions: [UserRole.MANAGER, UserRole.ADMIN],
    hideInMenu: true,
  },
  {
    path: '/users',
    element: UsersPage,
    label: 'Users',
    isProtected: true,
    permissions: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    path: '/admin/audit-logs',
    element: AuditLogPage,
    label: 'Audit Logs',
    isProtected: true,
    permissions: [UserRole.ADMIN],
  }
];
