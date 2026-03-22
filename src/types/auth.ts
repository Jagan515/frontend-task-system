export enum UserRole {
  CONSUMER = 'CONSUMER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  POWER_USER = 'POWER_USER',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
}
