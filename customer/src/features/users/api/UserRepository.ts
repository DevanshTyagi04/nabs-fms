import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerProfileData {
  id: string;
  userId: string;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export class UserRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  static async getCustomerProfile(): Promise<CustomerProfileData | null> {
    const client = this.getClient();
    try {
      const res = await client.users.getProfile();
      const u = res.data?.user || res.user;

      if (!u) return null;

      const cp = u.customerProfile || {};
      return {
        id: cp.id || u.id,
        userId: u.id,
        email: u.email,
        phone: u.phone,
        firstName: cp.firstName || u.firstName || '',
        lastName: cp.lastName || u.lastName || '',
        companyName: cp.companyName || '',
      };
    } catch {
      // Fallback to auth getMe if full profile fetch fails
      const res = await client.auth.getMe();
      const u = res.data?.user || res.user;
      if (!u) return null;

      return {
        id: u.customerProfileId || u.id,
        userId: u.id,
        email: u.email,
        phone: u.phone,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        companyName: '',
      };
    }
  }

  static async updateCustomerProfile(dto: Partial<CustomerProfileData>): Promise<CustomerProfileData> {
    const client = this.getClient();
    await client.users.updateCustomerProfile({
      firstName: dto.firstName,
      lastName: dto.lastName,
      companyName: dto.companyName,
    });
    const updated = await this.getCustomerProfile();
    return updated!;
  }
}
