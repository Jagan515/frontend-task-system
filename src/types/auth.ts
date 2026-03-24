export const UserRole = {
  USER: 'USER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',

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
  username?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}
