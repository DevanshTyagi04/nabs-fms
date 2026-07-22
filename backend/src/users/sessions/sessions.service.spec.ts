import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SessionsService } from './sessions.service';

describe('SessionsService (Session Management Verification)', () => {
  let sessionsService: SessionsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      refreshToken: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    sessionsService = new SessionsService(prismaMock);
  });

  describe('listActiveSessions', () => {
    it('should query active non-revoked sessions for user', async () => {
      prismaMock.refreshToken.findMany.mockResolvedValue([
        { id: 's-1', deviceName: 'Chrome on Windows' },
      ]);

      const res = await sessionsService.listActiveSessions('user-1');

      expect(prismaMock.refreshToken.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          revokedAt: null,
          expiresAt: { gte: expect.any(Date) },
        },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(res.sessions.length).toBe(1);
    });
  });

  describe('revokeSession', () => {
    it('should throw ForbiddenException if session belongs to another user', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 's-other',
        userId: 'other-user-id',
      });

      await expect(sessionsService.revokeSession('user-1', 's-other')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if session does not exist', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue(null);

      await expect(sessionsService.revokeSession('user-1', 's-nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
