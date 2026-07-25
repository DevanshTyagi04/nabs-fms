export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  customerProfileId?: string | null;
  vendorProfileId?: string | null;
  adminProfileId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  businessName?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginResponseData {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
  requestId?: string;
}
