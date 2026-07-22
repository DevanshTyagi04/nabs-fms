import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AuthService } from '../../auth';
import { PrismaService } from '../../prisma';
import { JOB_CLEANUP_EXPIRED_TOKENS, JOB_CLEANUP_OLD_NOTIFICATIONS } from '../constants/job-queues.constant';
import { MaintenanceCleanupJobPayload } from '../interfaces/job-payload.interface';
import { QueueService } from '../queues/queue.service';

@Injectable()
export class CleanupProcessor implements OnModuleInit {
  private readonly logger = new Logger(CleanupProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  onModuleInit() {
    this.queueService.registerProcessor(
      JOB_CLEANUP_EXPIRED_TOKENS,
      (data: MaintenanceCleanupJobPayload) => this.processExpiredTokenCleanup(data),
    );
    this.queueService.registerProcessor(
      JOB_CLEANUP_OLD_NOTIFICATIONS,
      (data: MaintenanceCleanupJobPayload) => this.processOldNotificationCleanup(data),
    );
  }

  async processExpiredTokenCleanup(payload: MaintenanceCleanupJobPayload) {
    this.logger.log(`[MAINTENANCE_JOB] Executing expired refresh token cleanup...`);
    const result = await this.authService.cleanupExpiredTokens();
    this.logger.log(`[MAINTENANCE_JOB] Expired token cleanup completed: ${JSON.stringify(result)}`);
    return result;
  }

  async processOldNotificationCleanup(payload: MaintenanceCleanupJobPayload) {
    this.logger.log(`[MAINTENANCE_JOB] Executing old notification cleanup...`);
    const retentionDays = payload.retentionDays || 90;
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    this.logger.log(`[MAINTENANCE_JOB] Old notification cleanup completed. Purged ${result.count} notifications.`);
    return { count: result.count };
  }
}
