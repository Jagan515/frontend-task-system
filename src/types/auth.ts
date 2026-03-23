export const UserRole = {
  USER: 'user',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const;

export const UserRoleLabels = {
  [UserRole.USER]: 'User',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.ADMIN]: 'Admin',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: number;
  email: string;
  username?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  passwordResetRequired?: boolean;
}
