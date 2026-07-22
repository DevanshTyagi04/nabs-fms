import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists active, non-revoked session records for the authenticated user
   */
  async listActiveSessions(userId: string) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gte: new Date() },
      },
      select: {
        id: true,
        deviceName: true,
        browser: true,
        platform: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Active sessions retrieved successfully',
      sessions,
    };
  }

  /**
   * Retrieves current session context
   */
  async getCurrentSession(userId: string, currentSessionId?: string) {
    let session = null;

    if (currentSessionId) {
      session = await this.prisma.refreshToken.findFirst({
        where: { id: currentSessionId, userId, revokedAt: null },
        select: {
          id: true,
          deviceName: true,
          browser: true,
          platform: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
      });
    }

    if (!session) {
      session = await this.prisma.refreshToken.findFirst({
        where: { userId, revokedAt: null, expiresAt: { gte: new Date() } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          deviceName: true,
          browser: true,
          platform: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
      });
    }

    if (!session) {
      throw new NotFoundException('Current active session not found');
    }

    return {
      message: 'Current session retrieved successfully',
      session,
    };
  }

  /**
   * Revokes a specific session owned by the authenticated user
   */
  async revokeSession(userId: string, sessionId: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { id: sessionId },
    });

    if (!tokenRecord) {
      throw new NotFoundException('Session not found');
    }

    if (tokenRecord.userId !== userId) {
      throw new ForbiddenException('You do not have permission to revoke this session');
    }

    if (!tokenRecord.revokedAt) {
      await this.prisma.refreshToken.update({
        where: { id: sessionId },
        data: {
          revokedAt: new Date(),
          revokedReason: 'USER_REVOKED_SPECIFIC_SESSION',
        },
      });

      this.logger.log(`[AUDIT_EVENT] [SESSION_REVOKED] User: [${userId}] Session: [${sessionId}]`);
    }

    return {
      message: 'Session revoked successfully',
    };
  }

  /**
   * Bulk revokes all active sessions for the authenticated user
   */
  async revokeAllSessions(userId: string) {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokedReason: 'USER_REVOKED_ALL_SESSIONS',
      },
    });

    this.logger.log(`[AUDIT_EVENT] [SESSION_REVOKED] User: [${userId}] Bulk Revoked: ${result.count}`);

    return {
      message: `Successfully logged out of ${result.count} active session(s)`,
    };
  }
}
