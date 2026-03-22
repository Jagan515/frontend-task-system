export const UserRole = {
  CONSUMER: 'CONSUMER',
  CONTRIBUTOR: 'CONTRIBUTOR',
  POWER_USER: 'POWER_USER',
} as const;

export const UserRoleLabels = {
  [UserRole.CONSUMER]: 'User',
  [UserRole.CONTRIBUTOR]: 'Manager',
  [UserRole.POWER_USER]: 'Admin',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: number;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}
