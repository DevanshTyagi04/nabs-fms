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
    const res = await client.auth.getMe();
    const u = res.data?.user || res.user;

    if (!u) return null;

    return {
      id: u.customerProfileId || u.id,
      userId: u.id,
      email: u.email,
      phone: u.phone,
      firstName: u.firstName || 'Jane',
      lastName: u.lastName || 'Doe',
      companyName: 'Acme Enterprises',
    };
  }

  static async updateCustomerProfile(dto: Partial<CustomerProfileData>): Promise<CustomerProfileData> {
    const current = await this.getCustomerProfile();
    return {
      ...current!,
      ...dto,
    };
  }
}
