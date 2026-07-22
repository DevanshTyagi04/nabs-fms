import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma';
import { DEFAULT_ACCESS_EXPIRATION, DEFAULT_REFRESH_EXPIRATION } from './constants';
import { LoginDto, LogoutDto, RefreshTokenDto, RegisterCustomerDto } from './dto';
import { AuthTokens, JwtPayload } from './interfaces';

export interface ClientSessionInfo {
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
}

export type AuthAuditEventType =
  | 'USER_REGISTER'
  | 'USER_LOGIN'
  | 'USER_LOGIN_FAILED'
  | 'USER_LOGOUT'
  | 'USER_LOGOUT_ALL_DEVICES'
  | 'REFRESH_TOKEN_ROTATED'
  | 'SECURITY_REPLAY_ATTACK_DETECTED';

// Pre-computed hash used for timing attack defense when user email is not found
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$dummySalt12345678$dummyHashValueToEqualizeTimingAttackTiming000000000000000000';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiration: string;
  private readonly refreshExpiration: string;
  private readonly argon2MemoryCost: number;
  private readonly argon2TimeCost: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret =
      this.configService.get<string>('jwt.accessSecret') || process.env.JWT_ACCESS_SECRET!;
    this.refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') || process.env.JWT_REFRESH_SECRET!;
    this.accessExpiration =
      this.configService.get<string>('jwt.accessExpiration') || DEFAULT_ACCESS_EXPIRATION;
    this.refreshExpiration =
      this.configService.get<string>('jwt.refreshExpiration') || DEFAULT_REFRESH_EXPIRATION;

    this.argon2MemoryCost =
      parseInt(this.configService.get<string>('ARGON2_MEMORY_COST') || '65536', 10);
    this.argon2TimeCost =
      parseInt(this.configService.get<string>('ARGON2_TIME_COST') || '3', 10);
  }

  /**
   * Hashes a plain-text string (password or token) using Argon2id
   */
  async hashString(value: string): Promise<string> {
    return argon2.hash(value, {
      type: argon2.argon2id,
      memoryCost: this.argon2MemoryCost,
      timeCost: this.argon2TimeCost,
      parallelism: 4,
    });
  }

  /**
   * Verifies a plain-text string against an Argon2 hash
   */
  async verifyHash(hash: string, value: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, value);
    } catch {
      return false;
    }
  }

  /**
   * Registers a new Customer account and creates their CustomerProfile atomically
   */
  async registerCustomer(dto: RegisterCustomerDto, clientInfo?: ClientSessionInfo) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedPhone = dto.phone.trim();

    // 1. Check for existing user by email or phone
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        throw new ConflictException('An account with this email address already exists');
      }
      throw new ConflictException('An account with this phone number already exists');
    }

    // 2. Hash password with Argon2id
    const passwordHash = await this.hashString(dto.password);

    // 3. Prisma transaction for User & CustomerProfile creation and session issuance
    const { user, tokens } = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          phone: normalizedPhone,
          passwordHash,
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
          customerProfile: {
            create: {
              firstName: dto.firstName.trim(),
              lastName: dto.lastName.trim(),
              companyName: dto.companyName?.trim() || null,
            },
          },
        },
        include: {
          customerProfile: true,
        },
      });

      const tokenPair = await this.generateAndStoreTokens(
        tx,
        newUser.id,
        newUser.email,
        newUser.role,
        clientInfo,
      );

      return { user: newUser, tokens: tokenPair };
    });

    this.emitAuthAuditEvent('USER_REGISTER', user.id, { email: user.email, role: user.role });

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        customerProfile: {
          id: user.customerProfile!.id,
          firstName: user.customerProfile!.firstName,
          lastName: user.customerProfile!.lastName,
          companyName: user.customerProfile!.companyName,
        },
      },
      tokens,
    };
  }

  /**
   * Universal User Login (CUSTOMER, VENDOR, ADMIN)
   */
  async login(dto: LoginDto, clientInfo?: ClientSessionInfo) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // 1. Fetch user by email
    const user = await this.prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        deletedAt: null,
      },
      include: {
        customerProfile: { select: { id: true, firstName: true, lastName: true } },
        vendorProfile: { select: { id: true, businessName: true } },
        adminProfile: { select: { id: true, department: true } },
      },
    });

    // 2. Timing attack protection
    if (!user) {
      await this.verifyHash(DUMMY_HASH, dto.password);
      this.emitAuthAuditEvent('USER_LOGIN_FAILED', null, { email: normalizedEmail, reason: 'NOT_FOUND' });
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Verify user status
    this.validateUserStatus(user.status);

    // 4. Verify password with Argon2
    const isPasswordValid = await this.verifyHash(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      this.emitAuthAuditEvent('USER_LOGIN_FAILED', user.id, { email: normalizedEmail, reason: 'INVALID_PASSWORD' });
      throw new UnauthorizedException('Invalid email or password');
    }

    // 5. Update lastLogin timestamp & generate session tokens atomically
    const tokens = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      return this.generateAndStoreTokens(
        tx,
        user.id,
        user.email,
        user.role,
        clientInfo,
      );
    });

    this.emitAuthAuditEvent('USER_LOGIN', user.id, { role: user.role });

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        customerProfileId: user.customerProfile?.id,
        vendorProfileId: user.vendorProfile?.id,
        adminProfileId: user.adminProfile?.id,
        firstName: user.customerProfile?.firstName,
        lastName: user.customerProfile?.lastName,
        businessName: user.vendorProfile?.businessName,
      },
      tokens,
    };
  }

  /**
   * Atomic O(1) Refresh Token Rotation inside a single Prisma Transaction with Replay Attack Prevention
   */
  async refreshToken(dto: RefreshTokenDto, clientInfo?: ClientSessionInfo) {
    // 1. Verify Refresh Token JWT signature & expiration
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!payload || !payload.sub || !payload.jti) {
      throw new UnauthorizedException('Invalid refresh token payload claims');
    }

    const tokenId = payload.jti;
    const userId = payload.sub;

    // 2. Execute entire token verification, revocation, and re-issuance inside a single Prisma Transaction
    const tokens = await this.prisma.$transaction(async (tx) => {
      // O(1) PK Lookup by `jti`
      const tokenRecord = await tx.refreshToken.findUnique({
        where: { id: tokenId },
      });

      if (!tokenRecord || tokenRecord.userId !== userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Replay Attack Detection & Security Invalidation
      if (tokenRecord.revokedAt) {
        this.emitAuthAuditEvent('SECURITY_REPLAY_ATTACK_DETECTED', userId, {
          tokenId,
          revokedAt: tokenRecord.revokedAt,
          revokedReason: tokenRecord.revokedReason,
        });

        // Bulk revoke all active sessions for compromised account
        await tx.refreshToken.updateMany({
          where: { userId, revokedAt: null },
          data: {
            revokedAt: new Date(),
            revokedReason: 'SECURITY_ALERT_REPLAY_ATTACK_DETECTED',
          },
        });

        throw new UnauthorizedException(
          'Security violation detected: Refresh token has already been revoked. All active sessions have been terminated for security.',
        );
      }

      // Expiration Check
      if (tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Verify Argon2 hash of presented token against stored hash
      const isValidHash = await this.verifyHash(tokenRecord.tokenHash, dto.refreshToken);
      if (!isValidHash) {
        throw new UnauthorizedException('Invalid refresh token signature');
      }

      // Verify User is active
      const user = await tx.user.findFirst({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        throw new UnauthorizedException('User account no longer exists');
      }

      this.validateUserStatus(user.status);

      // Issue new token pair
      const newJti = randomUUID();
      const newTokens = await this.generateAndStoreTokens(
        tx,
        user.id,
        user.email,
        user.role,
        clientInfo,
        newJti,
      );

      // Revoke old token & link replacement pointer
      await tx.refreshToken.update({
        where: { id: tokenId },
        data: {
          revokedAt: new Date(),
          revokedReason: 'TOKEN_ROTATION',
          replacedByTokenId: newJti,
        },
      });

      return newTokens;
    });

    this.emitAuthAuditEvent('REFRESH_TOKEN_ROTATED', userId, { oldTokenId: tokenId });

    return {
      message: 'Tokens refreshed successfully',
      tokens,
    };
  }

  /**
   * Logout user (single session or bulk all sessions via single DB update)
   */
  async logout(userId: string, dto?: LogoutDto) {
    if (dto?.allDevices) {
      const result = await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
          revokedReason: 'USER_LOGOUT_ALL_DEVICES',
        },
      });

      this.emitAuthAuditEvent('USER_LOGOUT_ALL_DEVICES', userId, { count: result.count });
    } else if (dto?.refreshToken) {
      try {
        const payload = this.jwtService.decode(dto.refreshToken) as JwtPayload;
        if (payload?.jti) {
          await this.prisma.refreshToken.updateMany({
            where: { id: payload.jti, userId, revokedAt: null },
            data: {
              revokedAt: new Date(),
              revokedReason: 'USER_LOGOUT_SINGLE_DEVICE',
            },
          });
        }
      } catch {
        await this.prisma.refreshToken.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date(), revokedReason: 'USER_LOGOUT' },
        });
      }
      this.emitAuthAuditEvent('USER_LOGOUT', userId);
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: {
          revokedAt: new Date(),
          revokedReason: 'USER_LOGOUT',
        },
      });
      this.emitAuthAuditEvent('USER_LOGOUT', userId);
    }

    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Scheduled Cleanup Helper: Purges expired and revoked refresh tokens older than 30 days
   */
  async cleanupExpiredTokens(): Promise<{ count: number }> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 30);

    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { lt: thresholdDate } },
        ],
      },
    });

    this.logger.log(`Scheduled Cleanup: Purged ${result.count} expired/revoked refresh tokens.`);
    return { count: result.count };
  }

  /**
   * Structured Audit Event Emitter Hook
   */
  private emitAuthAuditEvent(
    action: AuthAuditEventType,
    userId: string | null,
    metadata?: Record<string, any>,
  ) {
    this.logger.log(
      `[AUDIT_EVENT] [${action}] User: [${userId || 'ANONYMOUS'}] - ${JSON.stringify(metadata || {})}`,
    );
    // Extensible hook for AuditModule EventEmitter in future phase
  }

  /**
   * Session Limit Policy Enforcer: Ensures max active sessions per user
   */
  private async enforceMaxSessionLimit(
    tx: Prisma.TransactionClient,
    userId: string,
    maxSessions = 10,
  ) {
    const activeTokens = await tx.refreshToken.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    if (activeTokens.length >= maxSessions) {
      const overflowCount = activeTokens.length - maxSessions + 1;
      const tokensToRevoke = activeTokens.slice(0, overflowCount);
      const idsToRevoke = tokensToRevoke.map((t) => t.id);

      await tx.refreshToken.updateMany({
        where: { id: { in: idsToRevoke } },
        data: {
          revokedAt: new Date(),
          revokedReason: 'SESSION_LIMIT_EXCEEDED',
        },
      });
    }
  }

  /**
   * Helper: Validates user status across all schema defined statuses
   */
  private validateUserStatus(status: UserStatus) {
    switch (status) {
      case UserStatus.ACTIVE:
      case UserStatus.PENDING_VERIFICATION:
        return;
      case UserStatus.SUSPENDED:
        throw new UnauthorizedException('Your account has been suspended. Please contact support.');
      case UserStatus.INACTIVE:
        throw new UnauthorizedException('Your account is currently inactive.');
      default:
        throw new UnauthorizedException('Account status prohibits login');
    }
  }

  /**
   * Helper: Generates Access & Refresh JWT tokens with minimal claims and stores Argon2id hash in DB
   */
  private async generateAndStoreTokens(
    tx: Prisma.TransactionClient,
    userId: string,
    email: string,
    role: UserRole,
    clientInfo?: ClientSessionInfo,
    customJti?: string,
  ): Promise<AuthTokens> {
    const jti = customJti || randomUUID();

    // Enforce max session policy (e.g. max 10 active sessions)
    await this.enforceMaxSessionLimit(tx, userId, 10);

    // Minimal Access JWT Payload (sub, email, role)
    const accessPayload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    // Minimal Refresh JWT Payload (sub, email, role, jti)
    const refreshPayload: JwtPayload = {
      sub: userId,
      email,
      role,
      jti,
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiration as any,
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiration as any,
    });

    // Argon2id Hash of Refresh Token
    const tokenHash = await this.hashString(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store RefreshToken in DB
    await tx.refreshToken.create({
      data: {
        id: jti,
        userId,
        tokenHash,
        deviceName: clientInfo?.deviceName || 'Unknown Device',
        ipAddress: clientInfo?.ipAddress || null,
        userAgent: clientInfo?.userAgent || null,
        platform: clientInfo?.platform || null,
        browser: clientInfo?.browser || null,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }
}
