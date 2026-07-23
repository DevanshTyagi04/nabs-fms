import { UserRepository, VendorProfileData } from './UserRepository';

export class UserService {
  static async getVendorProfile(): Promise<VendorProfileData | null> {
    return UserRepository.getVendorProfile();
  }

  static async updateVendorProfile(dto: Partial<VendorProfileData>): Promise<VendorProfileData> {
    return UserRepository.updateVendorProfile(dto);
  }
}
