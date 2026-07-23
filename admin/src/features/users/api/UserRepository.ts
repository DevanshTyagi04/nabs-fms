import { SessionManager } from '@/auth/services/SessionManager';
import { User, UserFilters, UserListResult, CreateUserDto, UpdateUserDto } from '../types';
import { UserRole, UserStatus } from '@packages/shared-types';

export class UserRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  // Pre-seeded mock dataset for administrative users list management with SDK profile synchronization
  private static mockUsersDatabase: User[] = [
    {
      id: 'usr-admin-01',
      email: 'admin@nabs.com',
      phone: '+15550192834',
      role: 'ADMIN',
      status: 'ACTIVE',
      firstName: 'System',
      lastName: 'Administrator',
      department: 'Platform Operations',
      lastLogin: '2026-07-23T08:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr-vendor-01',
      email: 'vendor@nabs.com',
      phone: '+15550192835',
      role: 'VENDOR',
      status: 'ACTIVE',
      firstName: 'Apex',
      lastName: 'Services',
      businessName: 'Apex Field Services LLC',
      companyName: 'Apex Field Services LLC',
      lastLogin: '2026-07-22T14:30:00Z',
      createdAt: '2026-02-15T00:00:00Z',
    },
    {
      id: 'usr-customer-01',
      email: 'customer@nabs.com',
      phone: '+15550192836',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      firstName: 'Jane',
      lastName: 'Doe',
      companyName: 'Acme Enterprises',
      lastLogin: '2026-07-21T09:15:00Z',
      createdAt: '2026-03-10T00:00:00Z',
    },
  ];

  static async getProfile(): Promise<User | null> {
    const client = this.getClient();
    const res = await client.auth.getMe();
    const u = res.data?.user || res.user;

    if (!u) return null;

    return {
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role as UserRole,
      status: u.status as UserStatus,
      firstName: u.firstName,
      lastName: u.lastName,
      businessName: u.businessName,
      createdAt: new Date().toISOString(),
    };
  }

  static async listUsers(filters: UserFilters): Promise<UserListResult> {
    let result = [...this.mockUsersDatabase];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q) ||
          u.companyName?.toLowerCase().includes(q)
      );
    }

    if (filters.role && filters.role !== 'ALL') {
      result = result.filter((u) => u.role === filters.role);
    }

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((u) => u.status === filters.status);
    }

    const total = result.length;
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginatedUsers = result.slice(startIndex, startIndex + filters.pageSize);

    return {
      users: paginatedUsers,
      total,
    };
  }

  static async getUserById(id: string): Promise<User | null> {
    const found = this.mockUsersDatabase.find((u) => u.id === id);
    return found || null;
  }

  static async createUser(dto: CreateUserDto): Promise<User> {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: dto.email,
      phone: dto.phone,
      role: dto.role,
      status: 'ACTIVE',
      firstName: dto.firstName,
      lastName: dto.lastName,
      businessName: dto.businessName,
      companyName: dto.companyName,
      department: dto.department,
      createdAt: new Date().toISOString(),
    };

    this.mockUsersDatabase.unshift(newUser);
    return newUser;
  }

  static async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const index = this.mockUsersDatabase.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');

    const updated = {
      ...this.mockUsersDatabase[index],
      ...dto,
    };

    this.mockUsersDatabase[index] = updated;
    return updated;
  }

  static async setUserStatus(id: string, status: UserStatus): Promise<User> {
    const index = this.mockUsersDatabase.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');

    const updated = {
      ...this.mockUsersDatabase[index],
      status,
    };

    this.mockUsersDatabase[index] = updated;
    return updated;
  }
}
