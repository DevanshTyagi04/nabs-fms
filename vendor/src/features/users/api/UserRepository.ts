import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorProfileData {
  id: string;
  userId: string;
  email: string;
  phone: string;
  businessName?: string;
  companyName?: string;
  gstNumber?: string;
  panNumber?: string;
  secondaryPhone?: string;
  yearsExperience?: number;
  bio?: string;
  availabilityStatus?: string;
  averageRating?: number;
  totalCompletedJobs?: number;
}

export class UserRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  static async getVendorProfile(): Promise<VendorProfileData | null> {
    const client = this.getClient();
    const res = await client.auth.getMe();
    const u = res.data?.user || res.user;

    if (!u) return null;

    return {
      id: u.vendorProfileId || u.id,
      userId: u.id,
      email: u.email,
      phone: u.phone,
      businessName: u.businessName || 'Apex Field Services LLC',
      companyName: 'Apex Field Services LLC',
      gstNumber: '29ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      yearsExperience: 8,
      bio: 'Licensed electrical & HVAC service provider.',
      availabilityStatus: 'AVAILABLE',
      averageRating: 4.9,
      totalCompletedJobs: 42,
    };
  }

  static async updateVendorProfile(dto: Partial<VendorProfileData>): Promise<VendorProfileData> {
    const current = await this.getVendorProfile();
    return {
      ...current!,
      ...dto,
    };
  }
}
