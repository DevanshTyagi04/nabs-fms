import { Injectable, Logger } from '@nestjs/common';
import {
  INotificationProvider,
  NotificationPayload,
  ProviderDeliveryResult,
} from './interfaces/notification-provider.interface';

@Injectable()
export class EmailProvider implements INotificationProvider {
  readonly providerName = 'EMAIL';
  private readonly logger = new Logger(EmailProvider.name);

  async send(payload: NotificationPayload): Promise<ProviderDeliveryResult> {
    if (!payload.recipientEmail) {
      return {
        delivered: false,
        providerName: this.providerName,
        error: 'No recipient email address provided',
      };
    }

    try {
      const sentAt = new Date();
      // Simulation / Pluggable Email Engine (SendGrid / AWS SES / Mailgun integration)
      this.logger.log(
        `Email notification dispatched to [${payload.recipientEmail}]: Subject: "${payload.title}" Body: "${payload.body.slice(0, 60)}..."`,
      );

      return {
        delivered: true,
        providerName: this.providerName,
        sentAt,
      };
    } catch (error: any) {
      this.logger.error(`Email delivery failed to [${payload.recipientEmail}]: ${error.message}`);
      return {
        delivered: false,
        providerName: this.providerName,
        error: error.message,
      };
    }
  }
}
