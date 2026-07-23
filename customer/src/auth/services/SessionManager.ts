import { NabsClient, AuthUser } from '@nabs/sdk';
import { apiConfig } from '@/config/api';
import { TokenManager } from '../storage/TokenManager';

export class SessionManager {
  private static clientInstance: NabsClient | null = null;
  private static refreshPromise: Promise<string | null> | null = null;

  static getClient(): NabsClient {
    if (!this.clientInstance) {
      this.clientInstance = new NabsClient({
        baseUrl: apiConfig.baseUrl,
        onUnauthorized: async () => {
          return this.refreshSession();
        },
      });
    }
    return this.clientInstance;
  }

  static async login(credentials: { email: string; password: string }): Promise<{ user: AuthUser; accessToken: string }> {
    const client = this.getClient();
    const response = await client.auth.login(credentials);

    if (!response.data || !response.data.tokens) {
      throw new Error(response.message || 'Login failed');
    }

    const { user, tokens } = response.data;
    await TokenManager.setTokens(tokens);
    client.setToken(tokens.accessToken);

    return { user, accessToken: tokens.accessToken };
  }

  static async refreshSession(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = await TokenManager.getRefreshToken();
        if (!refreshToken) {
          await TokenManager.clearTokens();
          return null;
        }

        const client = this.getClient();
        const response = await client.auth.refreshToken({ refreshToken });

        if (!response.data || !response.data.tokens) {
          await TokenManager.clearTokens();
          return null;
        }

        const newTokens = response.data.tokens;
        await TokenManager.setTokens(newTokens);
        client.setToken(newTokens.accessToken);

        return newTokens.accessToken;
      } catch (err) {
        await TokenManager.clearTokens();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  static async restoreSession(): Promise<AuthUser | null> {
    let accessToken = await TokenManager.getAccessToken();
    const refreshToken = await TokenManager.getRefreshToken();

    if (!accessToken && !refreshToken) {
      return null;
    }

    if (await TokenManager.isAccessTokenExpired()) {
      accessToken = await this.refreshSession();
      if (!accessToken) return null;
    }

    const client = this.getClient();
    client.setToken(accessToken || undefined);

    try {
      const res = await client.auth.getMe();
      return res.data?.user || res.user || null;
    } catch {
      accessToken = await this.refreshSession();
      if (!accessToken) return null;

      try {
        const retryRes = await client.auth.getMe();
        return retryRes.data?.user || retryRes.user || null;
      } catch {
        await TokenManager.clearTokens();
        return null;
      }
    }
  }

  static async logout(): Promise<void> {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      const client = this.getClient();
      if (refreshToken) {
        await client.auth.logout({ refreshToken }).catch(() => {});
      }
    } finally {
      await TokenManager.clearTokens();
      const client = this.getClient();
      client.setToken(undefined);
    }
  }
}
