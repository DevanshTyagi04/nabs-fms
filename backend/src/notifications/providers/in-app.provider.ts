import { Injectable, Logger } from '@nestjs/common';
import { NotificationDeliveryStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';
import {
  INotificationProvider,
  NotificationPayload,
  ProviderDeliveryResult,
} from './interfaces/notification-provider.interface';

@Injectable()
export class InAppProvider implements INotificationProvider {
  readonly providerName = 'IN_APP';
  private readonly logger = new Logger(InAppProvider.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(payload: NotificationPayload): Promise<ProviderDeliveryResult> {
    try {
      const sentAt = new Date();
      const notification = await this.prisma.notification.create({
        data: {
          recipientId: payload.recipientId,
          title: payload.title,
          body: payload.body,
          type: payload.type,
          deliveryStatus: NotificationDeliveryStatus.DELIVERED,
          isRead: false,
          sentAt,
        },
        select: { id: true },
      });

      this.logger.log(`In-App notification delivered to User [${payload.recipientId}]: [${payload.title}] (ID: ${notification.id})`);

      return {
        delivered: true,
        providerName: this.providerName,
        sentAt,
        notificationId: notification.id,
      };
    } catch (error: any) {
      this.logger.error(`In-App notification delivery failed for User [${payload.recipientId}]: ${error.message}`);
      return {
        delivered: false,
        providerName: this.providerName,
        error: error.message,
      };
    }
  }
}
