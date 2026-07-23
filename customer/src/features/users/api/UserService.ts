import { UserRepository, CustomerProfileData } from './UserRepository';

export class UserService {
  static async getCustomerProfile(): Promise<CustomerProfileData | null> {
    return UserRepository.getCustomerProfile();
  }

  static async updateCustomerProfile(dto: Partial<CustomerProfileData>): Promise<CustomerProfileData> {
    return UserRepository.updateCustomerProfile(dto);
  }
}
