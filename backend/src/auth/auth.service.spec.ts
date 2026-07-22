import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService (Unit & Integration Hardening)', () => {
  let authService: AuthService;
  let prismaMock: any;
  let jwtServiceMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      customerProfile: {
        create: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
      },
      $transaction: jest.fn((cb: any) => cb(prismaMock)),
    };

    jwtServiceMock = {
      signAsync: jest.fn().mockResolvedValue('mocked_jwt_token_string'),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    };

    configServiceMock = {
      get: jest.fn((key: string) => {
        if (key === 'jwt.accessSecret') return 'test_access_secret_key_32_bytes_min';
        if (key === 'jwt.refreshSecret') return 'test_refresh_secret_key_32_bytes_min';
        if (key === 'jwt.accessExpiration') return '15m';
        if (key === 'jwt.refreshExpiration') return '7d';
        return null;
      }),
    };

    authService = new AuthService(prismaMock, jwtServiceMock, configServiceMock);
  });

  describe('registerCustomer', () => {
    it('should throw ConflictException if duplicate email exists', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'u-1',
        email: 'duplicate@nabs.com',
        phone: '+18005550111',
      });

      const registerDto = {
        email: 'duplicate@nabs.com',
        phone: '+18005550199',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(authService.registerCustomer(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException on invalid credentials', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nonexistent@nabs.com', password: 'WrongPassword123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for SUSPENDED user account', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'u-suspended',
        email: 'suspended@nabs.com',
        passwordHash: 'hashed_password',
        status: UserStatus.SUSPENDED,
        role: UserRole.CUSTOMER,
      });

      await expect(
        authService.login({ email: 'suspended@nabs.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken (Atomic Transaction, O(1) jti lookup & Replay Attack Defense)', () => {
    it('should throw UnauthorizedException if refresh token is invalid or expired', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('Jwt expired'));

      await expect(
        authService.refreshToken({ refreshToken: 'invalid_expired_token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should detect Replay Attack on revoked token and bulk revoke all user sessions', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: 'user-123',
        jti: 'token-uuid-revoked',
        role: UserRole.CUSTOMER,
      });

      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'token-uuid-revoked',
        userId: 'user-123',
        tokenHash: 'hashed_token',
        revokedAt: new Date(), // Already revoked!
        expiresAt: new Date(Date.now() + 86400000),
      });

      await expect(
        authService.refreshToken({ refreshToken: 'revoked_token' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', revokedAt: null },
        data: {
          revokedAt: expect.any(Date),
          revokedReason: 'SECURITY_ALERT_REPLAY_ATTACK_DETECTED',
        },
      });
    });
  });

  describe('logout', () => {
    it('should perform single updateMany DB query on allDevices bulk logout', async () => {
      prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      const response = await authService.logout('user-123', { allDevices: true });

      expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', revokedAt: null },
        data: { revokedAt: expect.any(Date), revokedReason: 'USER_LOGOUT_ALL_DEVICES' },
      });
      expect(response.message).toBe('Logged out successfully');
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should purge expired and revoked refresh tokens', async () => {
      const result = await authService.cleanupExpiredTokens();
      expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalled();
      expect(result.count).toBe(5);
    });
  });
});
