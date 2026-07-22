import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma';
import {
  EMAIL_PROVIDER_TOKEN,
  IN_APP_PROVIDER_TOKEN,
  INotificationProvider,
  NotificationPayload,
  ProviderDeliveryResult,
} from '../providers/interfaces/notification-provider.interface';

const DEFAULT_PROVIDER_TIMEOUT_MS = 5000;

export interface RecipientInfo {
  recipientId: string;
  recipientEmail?: string;
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
}

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(IN_APP_PROVIDER_TOKEN)
    private readonly inAppProvider: INotificationProvider,
    @Inject(EMAIL_PROVIDER_TOKEN)
    private readonly emailProvider: INotificationProvider,
  ) {}

  /**
   * Helper: Wraps provider execution in a timeout promise to prevent provider hanging
   */
  private async executeWithTimeout(
    provider: INotificationProvider,
    payload: NotificationPayload,
  ): Promise<ProviderDeliveryResult> {
    const timeoutPromise = new Promise<ProviderDeliveryResult>((_, reject) =>
      setTimeout(() => reject(new Error(`Provider [${provider.providerName}] timed out after ${DEFAULT_PROVIDER_TIMEOUT_MS}ms`)), DEFAULT_PROVIDER_TIMEOUT_MS),
    );

    try {
      return await Promise.race([provider.send(payload), timeoutPromise]);
    } catch (error: any) {
      this.logger.error(`Provider [${provider.providerName}] error isolation triggered: ${error.message}`);
      return {
        delivered: false,
        providerName: provider.providerName,
        error: error.message,
      };
    }
  }

  /**
   * Helper: Idempotency check to prevent duplicate notification dispatching
   */
  private async isDuplicateDelivery(recipientId: string, title: string, type: NotificationType): Promise<boolean> {
    const sixtySecondsAgo = new Date(Date.now() - 60000);
    const existing = await this.prisma.notification.findFirst({
      where: {
        recipientId,
        title,
        type,
        createdAt: { gte: sixtySecondsAgo },
      },
      select: { id: true },
    });

    return !!existing;
  }

  /**
   * Dispatches a notification to a single recipient resolving preferences, channels, and error isolation
   */
  async dispatchToRecipient(recipient: RecipientInfo, title: string, body: string, type: NotificationType) {
    const { recipientId, recipientEmail } = recipient;
    const inAppEnabled = recipient.inAppEnabled ?? true;
    const emailEnabled = recipient.emailEnabled ?? true;

    // 1. Idempotency Check (Recommendation 2)
    const isDuplicate = await this.isDuplicateDelivery(recipientId, title, type);
    if (isDuplicate) {
      this.logger.log(`[IDEMPOTENCY] Duplicate notification ignored for Recipient [${recipientId}]: [${title}]`);
      return { message: 'Duplicate notification suppressed', isDuplicate: true };
    }

    const payload: NotificationPayload = {
      recipientId,
      recipientEmail,
      title,
      body,
      type,
    };

    const results: ProviderDeliveryResult[] = [];

    // 2. Channel Resolution & Provider Isolation (Recommendation 1 & 4)
    if (inAppEnabled) {
      const inAppResult = await this.executeWithTimeout(this.inAppProvider, payload);
      results.push(inAppResult);
    }

    if (emailEnabled && recipientEmail) {
      const emailResult = await this.executeWithTimeout(this.emailProvider, payload);
      results.push(emailResult);
    }

    const overallDelivered = results.some((r) => r.delivered);
    const auditAction = overallDelivered ? 'NOTIFICATION_SENT' : 'NOTIFICATION_FAILED';
    this.logger.log(`[AUDIT_EVENT] [${auditAction}] Recipient: [${recipientId}] Type: [${type}] Title: [${title}]`);

    return {
      recipientId,
      delivered: overallDelivered,
      results,
    };
  }

  /**
   * Dispatches a notification to multiple recipients with strict Recipient Isolation (Recommendation 3)
   */
  async dispatchToMultipleRecipients(
    recipients: RecipientInfo[],
    title: string,
    body: string,
    type: NotificationType,
  ) {
    this.logger.log(`Dispatching [${type}] notification to ${recipients.length} recipients...`);

    // Multi-Recipient Isolation: Each recipient delivery runs independently via Promise.allSettled
    const deliveryPromises = recipients.map((r) =>
      this.dispatchToRecipient(r, title, body, type).catch((err) => {
        this.logger.error(`Recipient isolation caught error for [${r.recipientId}]: ${err.message}`);
        return { recipientId: r.recipientId, delivered: false, error: err.message };
      }),
    );

    const results = await Promise.allSettled(deliveryPromises);
    return results.map((r) => (r.status === 'fulfilled' ? r.value : { delivered: false, error: 'Rejected' }));
  }
}
