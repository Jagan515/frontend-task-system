import React from 'react';
import { Dashboard } from '../pages/Dashboard';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { CreateTaskPage } from '../pages/CreateTaskPage';
import { AuditLogPage } from '../pages/AuditLogPage';
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
    path: '/',
    element: Dashboard,
    label: 'Dashboard',
    isProtected: true,
    permissions: [UserRole.CONSUMER, UserRole.CONTRIBUTOR, UserRole.POWER_USER],
  },
  {
    path: '/tasks/create',
    element: CreateTaskPage,
    label: 'Create Task',
    isProtected: true,
    permissions: [UserRole.CONTRIBUTOR, UserRole.POWER_USER],
  },
  {
    path: '/admin/audit-logs',
    element: AuditLogPage,
    label: 'Audit Logs',
    isProtected: true,
    permissions: [UserRole.POWER_USER],
  }
];
