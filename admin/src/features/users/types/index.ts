import { UserRole, UserStatus } from '@packages/shared-types';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  companyName?: string;
  department?: string;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserDto {
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  companyName?: string;
  department?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  businessName?: string;
  companyName?: string;
  department?: string;
}

export interface UserListResult {
  users: User[];
  total: number;
}
