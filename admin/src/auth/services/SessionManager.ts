import { NabsClient, AuthUser } from '@nabs/sdk';
import { apiConfig } from '@/config/api';
import { TokenManager } from '../storage/TokenManager';

export class SessionManager {
  private static clientInstance: NabsClient | null = null;
  private static refreshPromise: Promise<string | null> | null = null;

  static getClient(): NabsClient {
    if (!this.clientInstance) {
      const accessToken = TokenManager.getAccessToken() || undefined;
      this.clientInstance = new NabsClient({
        baseUrl: apiConfig.baseUrl,
        token: accessToken,
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
    TokenManager.setTokens(tokens);
    client.setToken(tokens.accessToken);

    return { user, accessToken: tokens.accessToken };
  }

  static async refreshSession(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          TokenManager.clearTokens();
          return null;
        }

        const client = this.getClient();
        const response = await client.auth.refreshToken({ refreshToken });

        if (!response.data || !response.data.tokens) {
          TokenManager.clearTokens();
          return null;
        }

        const newTokens = response.data.tokens;
        TokenManager.setTokens(newTokens);
        client.setToken(newTokens.accessToken);

        return newTokens.accessToken;
      } catch (err) {
        TokenManager.clearTokens();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  static async restoreSession(): Promise<AuthUser | null> {
    let accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();

    if (!accessToken && !refreshToken) {
      return null;
    }

    if (TokenManager.isAccessTokenExpired()) {
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
        TokenManager.clearTokens();
        return null;
      }
    }
  }

  static async logout(): Promise<void> {
    try {
      const refreshToken = TokenManager.getRefreshToken() || undefined;
      const client = this.getClient();
      if (refreshToken) {
        await client.auth.logout({ refreshToken }).catch(() => {});
      }
    } finally {
      TokenManager.clearTokens();
      const client = this.getClient();
      client.setToken(undefined);
    }
  }
}
