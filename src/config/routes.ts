import React from 'react';
import { Dashboard } from '../pages/Dashboard';
import { LoginPage } from '../pages/LoginPage';
import { CreateTaskPage } from '../pages/CreateTaskPage';
import { AuditLogPage } from '../pages/AuditLogPage';

export interface RouteConfig {
  path: string;
  element: React.FC;
  label?: string;           // Optional: for sidebar or navigation
  isProtected: boolean;     // Whether login is required
  permissions?: string[];   // Allowed roles (e.g., ['CONTRIBUTOR', 'POWER_USER'])
  hideInMenu?: boolean;     // For routes like /login
}

export const APP_ROUTES: RouteConfig[] = [
  {
    path: '/login',
    element: LoginPage,
    isProtected: false,
    hideInMenu: true,
  },
  {
    path: '/',
    element: Dashboard,
    label: 'Dashboard',
    isProtected: true,
    permissions: ['CONSUMER', 'CONTRIBUTOR', 'POWER_USER'],
  },
  {
    path: '/tasks/create',
    element: CreateTaskPage,
    label: 'Create Task',
    isProtected: true,
    permissions: ['CONTRIBUTOR', 'POWER_USER'],
  },
  {
    path: '/admin/audit-logs',
    element: AuditLogPage,
    label: 'Audit Logs',
    isProtected: true,
    permissions: ['POWER_USER'],
  }
];
