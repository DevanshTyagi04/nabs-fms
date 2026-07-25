import {
  Notification,
  NotificationDeliveryStatus,
  NotificationType,
  PrismaClient,
  User,
} from '@prisma/client';
import { SeededAdmin } from './users.seed';
import { SeededCustomer } from './customers.seed';
import { SeededVendor } from './vendors.seed';
import { getRandomDateInPastDays, getRandomElement } from './data-generators';

export async function seedNotifications(
  prisma: PrismaClient,
  admins: SeededAdmin[],
  customers: SeededCustomer[],
  vendors: SeededVendor[],
  targetCount: number = 200,
): Promise<Notification[]> {
  console.log(`🔔 Seeding ${targetCount} User Notifications...`);

  // Collect all user objects
  const allUsers: User[] = [
    ...admins.map((a) => a.user),
    ...customers.map((c) => c.user),
    ...vendors.map((v) => v.user),
  ];

  const notificationTemplates = [
    {
      title: 'Vendor Assigned to Service Request',
      body: 'Your service request has been assigned to a verified technician.',
      type: NotificationType.REQUEST_STATUS,
    },
    {
      title: 'Technical Survey Report Submitted',
      body: 'The vendor has uploaded the site survey inspection results.',
      type: NotificationType.SURVEY_UPDATE,
    },
    {
      title: 'New Financial Estimate Ready for Review',
      body: 'An itemized price estimate has been generated for your approval.',
      type: NotificationType.ESTIMATE_UPDATE,
    },
    {
      title: 'Work Order Scheduled',
      body: 'Technicians are scheduled to visit your site tomorrow at 10:00 AM.',
      type: NotificationType.WORK_ORDER_UPDATE,
    },
    {
      title: 'Payment Confirmation Received',
      body: 'Your payment of ₹8,500 has been successfully processed.',
      type: NotificationType.PAYMENT_CONFIRMATION,
    },
    {
      title: 'System Security Alert & Audit Log',
      body: 'New login detected from a verified browser session.',
      type: NotificationType.SYSTEM,
    },
  ];

  const seededNotifications: Notification[] = [];

  for (let i = 0; i < targetCount; i++) {
    const recipient = getRandomElement(allUsers);
    const template = getRandomElement(notificationTemplates);
    const createdAt = getRandomDateInPastDays(120);

    const isRead = i % 3 !== 0; // ~66% read, ~33% unread

    const notification = await prisma.notification.create({
      data: {
        recipientId: recipient.id,
        title: template.title,
        body: template.body,
        type: template.type,
        deliveryStatus: NotificationDeliveryStatus.DELIVERED,
        isRead,
        sentAt: createdAt,
        readAt: isRead ? new Date(createdAt.getTime() + 1800000) : null,
        createdAt,
      },
    });

    seededNotifications.push(notification);
  }

  console.log(`✅ ${seededNotifications.length} Notifications seeded.`);
  return seededNotifications;
}
