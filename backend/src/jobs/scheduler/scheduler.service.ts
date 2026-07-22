import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  JOB_CLEANUP_EXPIRED_TOKENS,
  JOB_CLEANUP_OLD_NOTIFICATIONS,
  QUEUE_MAINTENANCE,
} from '../constants/job-queues.constant';
import { QueueService } from '../queues/queue.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly queueService: QueueService) {}

  onModuleInit() {
    this.logger.log('SchedulerService initialized. Scheduling maintenance jobs...');

    // Recommendation 5: Scheduler Isolation - Scheduler ONLY enqueues maintenance jobs
    this.scheduleTokenCleanupJob();
    this.scheduleNotificationCleanupJob();
  }

  /**
   * Enqueues daily expired refresh token cleanup job to QUEUE_MAINTENANCE
   */
  async scheduleTokenCleanupJob() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const jobId = `maintenance-cleanup:tokens:${todayStr}`;

    await this.queueService.addJob(
      QUEUE_MAINTENANCE,
      JOB_CLEANUP_EXPIRED_TOKENS,
      { taskName: 'TokenCleanup' },
      { jobId, attempts: 3 },
    );
  }

  /**
   * Enqueues periodic old notification cleanup job to QUEUE_MAINTENANCE
   */
  async scheduleNotificationCleanupJob() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const jobId = `maintenance-cleanup:notifications:${todayStr}`;

    await this.queueService.addJob(
      QUEUE_MAINTENANCE,
      JOB_CLEANUP_OLD_NOTIFICATIONS,
      { taskName: 'NotificationCleanup', retentionDays: 90 },
      { jobId, attempts: 3 },
    );
  }
}
