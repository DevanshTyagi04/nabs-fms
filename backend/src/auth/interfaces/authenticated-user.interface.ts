import { UserRole, UserStatus } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  customerProfileId?: string;
  vendorProfileId?: string;
  adminProfileId?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
}
