import { UserRepository } from './UserRepository';
import { User, UserFilters, UserListResult, CreateUserDto, UpdateUserDto } from '../types';
import { UserStatus } from '@packages/shared-types';

export class UserService {
  static async getProfile(): Promise<User | null> {
    return UserRepository.getProfile();
  }

  static async listUsers(filters: UserFilters): Promise<UserListResult> {
    return UserRepository.listUsers(filters);
  }

  static async getUserById(id: string): Promise<User | null> {
    return UserRepository.getUserById(id);
  }

  static async createUser(dto: CreateUserDto): Promise<User> {
    if (!dto.email || !dto.email.includes('@')) {
      throw new Error('Valid email address is required');
    }
    if (!dto.password || dto.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    return UserRepository.createUser(dto);
  }

  static async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    return UserRepository.updateUser(id, dto);
  }

  static async setUserStatus(id: string, status: UserStatus): Promise<User> {
    return UserRepository.setUserStatus(id, status);
  }
}
