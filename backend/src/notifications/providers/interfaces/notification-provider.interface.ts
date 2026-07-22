import { NotificationType } from '@prisma/client';

export const IN_APP_PROVIDER_TOKEN = Symbol('IN_APP_PROVIDER_TOKEN');
export const EMAIL_PROVIDER_TOKEN = Symbol('EMAIL_PROVIDER_TOKEN');

export interface NotificationPayload {
  recipientId: string;
  recipientEmail?: string;
  title: string;
  body: string;
  type: NotificationType;
  eventId?: string;
}

export interface ProviderDeliveryResult {
  delivered: boolean;
  providerName: string;
  error?: string;
  sentAt?: Date;
  notificationId?: string;
}

export interface INotificationProvider {
  readonly providerName: string;

  /**
   * Delivers a notification payload via this provider
   */
  send(payload: NotificationPayload): Promise<ProviderDeliveryResult>;
}
