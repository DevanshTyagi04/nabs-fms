import { authConfig } from '@/config/auth';
import { isTokenExpired } from '../utils';

export class TokenManager {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  static getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    try {
      return localStorage.getItem(authConfig.accessTokenKey);
    } catch {
      return null;
    }
  }

  static getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    try {
      return localStorage.getItem(authConfig.refreshTokenKey);
    } catch {
      return null;
    }
  }

  static setTokens(tokens: { accessToken: string; refreshToken: string }) {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(authConfig.accessTokenKey, tokens.accessToken);
      localStorage.setItem(authConfig.refreshTokenKey, tokens.refreshToken);
    } catch (e) {
      console.error('Failed to store authentication tokens', e);
    }
  }

  static clearTokens() {
    if (!this.isBrowser()) return;
    try {
      localStorage.removeItem(authConfig.accessTokenKey);
      localStorage.removeItem(authConfig.refreshTokenKey);
    } catch (e) {
      console.error('Failed to clear authentication tokens', e);
    }
  }

  static isAccessTokenExpired(thresholdSeconds = authConfig.refreshThresholdSeconds): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    return isTokenExpired(token, thresholdSeconds);
  }
}
