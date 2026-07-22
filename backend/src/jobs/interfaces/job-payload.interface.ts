import { NotificationType } from '@prisma/client';

export interface NotificationJobPayload {
  recipientId: string;
  recipientEmail?: string;
  title: string;
  body: string;
  type: NotificationType;
  eventId?: string;
}

export interface MultiNotificationJobPayload {
  recipients: Array<{ recipientId: string; recipientEmail?: string }>;
  title: string;
  body: string;
  type: NotificationType;
  eventId?: string;
}

export interface InvoicePdfJobPayload {
  invoiceId: string;
  actorUserId?: string;
}

export interface PaymentReconcileJobPayload {
  paymentId: string;
  actorUserId?: string;
}

export interface MaintenanceCleanupJobPayload {
  taskName: string;
  retentionDays?: number;
}
