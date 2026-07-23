import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { authConfig } from '@/config/auth';
import { isTokenExpired } from '../utils';

export class TokenManager {
  private static inMemoryStore: Record<string, string> = {};

  private static isSecureStoreAvailable(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  static async getAccessToken(): Promise<string | null> {
    if (this.isSecureStoreAvailable()) {
      try {
        return await SecureStore.getItemAsync(authConfig.accessTokenKey);
      } catch {
        return this.inMemoryStore[authConfig.accessTokenKey] || null;
      }
    }
    return this.inMemoryStore[authConfig.accessTokenKey] || null;
  }

  static async getRefreshToken(): Promise<string | null> {
    if (this.isSecureStoreAvailable()) {
      try {
        return await SecureStore.getItemAsync(authConfig.refreshTokenKey);
      } catch {
        return this.inMemoryStore[authConfig.refreshTokenKey] || null;
      }
    }
    return this.inMemoryStore[authConfig.refreshTokenKey] || null;
  }

  static async setTokens(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
    this.inMemoryStore[authConfig.accessTokenKey] = tokens.accessToken;
    this.inMemoryStore[authConfig.refreshTokenKey] = tokens.refreshToken;

    if (this.isSecureStoreAvailable()) {
      try {
        await SecureStore.setItemAsync(authConfig.accessTokenKey, tokens.accessToken);
        await SecureStore.setItemAsync(authConfig.refreshTokenKey, tokens.refreshToken);
      } catch (e) {
        console.error('Failed to save secure tokens', e);
      }
    }
  }

  static async clearTokens(): Promise<void> {
    delete this.inMemoryStore[authConfig.accessTokenKey];
    delete this.inMemoryStore[authConfig.refreshTokenKey];

    if (this.isSecureStoreAvailable()) {
      try {
        await SecureStore.deleteItemAsync(authConfig.accessTokenKey);
        await SecureStore.deleteItemAsync(authConfig.refreshTokenKey);
      } catch (e) {
        console.error('Failed to clear secure tokens', e);
      }
    }
  }

  static async isAccessTokenExpired(thresholdSeconds = authConfig.refreshThresholdSeconds): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return true;
    return isTokenExpired(token, thresholdSeconds);
  }
}
