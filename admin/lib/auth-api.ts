import { apiClient } from './api-client';
import { LoginFormData } from './schemas/auth.schema';
import { ApiResponse, LoginResponseData, User } from './types/auth.types';

export const authApi = {
  /**
   * Authenticates user via Email & Password using backend /auth/login endpoint
   */
  async login(credentials: LoginFormData): Promise<LoginResponseData> {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data.data;
  },

  /**
   * Retrieves current authenticated user context from backend /auth/me endpoint
   */
  async getMe(): Promise<{ user: User }> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data;
  },

  /**
   * Logs out user and revokes active session on backend /auth/logout endpoint
   */
  async logout(refreshToken?: string, allDevices = false): Promise<void> {
    await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout', {
      refreshToken,
      allDevices,
    });
  },
};
