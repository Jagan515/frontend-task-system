import { UserRole } from '../types/auth';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { Dashboard } from '../pages/Dashboard';
import { TasksPage } from '../pages/TasksPage';
import { AuditLogPage } from '../pages/AuditLogPage';
import { UsersPage } from '../pages/UsersPage';
import React from 'react';


export interface RouteConfig {
  path: string;
  isProtected: boolean;
  permissions?: UserRole[];
  element: React.FC;
  label?: string;
  hideInMenu?: boolean;
}

export const APP_ROUTES: RouteConfig[] = [
  {
    path: '/login',
    isProtected: false,
    element: LoginPage,
    hideInMenu: true,
  },
  {
    path: '/signup',
    isProtected: false,
    element: SignupPage,
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
    isProtected: true,
    permissions: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
    element: Dashboard,
    label: 'Dashboard',


  },
  {
    path: '/tasks',
    isProtected: true,
    permissions: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
    element: TasksPage,
    label: 'Tasks',

  },
  {
    path: '/tasks/create',
    isProtected: true,
    permissions: [UserRole.MANAGER, UserRole.ADMIN],

    element: TasksPage,

    hideInMenu: true,
  },
  {
    path: '/users',
    isProtected: true,
    permissions: [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
    element: UsersPage,
    label: 'Users',
  },
  {
    path: '/audit-log',
    isProtected: true,
    permissions: [UserRole.ADMIN],
    element: AuditLogPage,
    label: 'Audit Log',
  },

];
