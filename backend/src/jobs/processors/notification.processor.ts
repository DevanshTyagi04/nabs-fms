import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationDispatcherService } from '../../notifications/dispatcher/notification-dispatcher.service';
import { JOB_DISPATCH_MULTI_NOTIFICATION, JOB_DISPATCH_NOTIFICATION } from '../constants/job-queues.constant';
import { MultiNotificationJobPayload, NotificationJobPayload } from '../interfaces/job-payload.interface';
import { QueueService } from '../queues/queue.service';

@Injectable()
export class NotificationProcessor implements OnModuleInit {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  onModuleInit() {
    this.queueService.registerProcessor(
      JOB_DISPATCH_NOTIFICATION,
      (data: NotificationJobPayload) => this.processSingleNotification(data),
    );
    this.queueService.registerProcessor(
      JOB_DISPATCH_MULTI_NOTIFICATION,
      (data: MultiNotificationJobPayload) => this.processMultiNotification(data),
    );
  }

  async processSingleNotification(payload: NotificationJobPayload) {
    this.logger.log(`Processing background notification job for Recipient [${payload.recipientId}]`);
    return this.dispatcher.dispatchToRecipient(
      { recipientId: payload.recipientId, recipientEmail: payload.recipientEmail },
      payload.title,
      payload.body,
      payload.type,
    );
  }

  async processMultiNotification(payload: MultiNotificationJobPayload) {
    this.logger.log(`Processing multi-recipient background notification job for ${payload.recipients.length} recipients`);
    return this.dispatcher.dispatchToMultipleRecipients(
      payload.recipients,
      payload.title,
      payload.body,
      payload.type,
    );
  }
}
