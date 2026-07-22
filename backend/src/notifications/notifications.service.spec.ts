import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationDeliveryStatus, NotificationType } from '@prisma/client';
import { NotificationDispatcherService } from './dispatcher/notification-dispatcher.service';
import { NotificationEventListener } from './events/notification-event.listener';
import { NotificationsService } from './notifications.service';

describe('Notifications Module (Phase 10 Unit & Integration Tests)', () => {
  let notificationsService: NotificationsService;
  let dispatcher: NotificationDispatcherService;
  let eventListener: NotificationEventListener;
  let inAppProviderMock: any;
  let emailProviderMock: any;
  let prismaMock: any;

  beforeEach(() => {
    inAppProviderMock = {
      providerName: 'IN_APP',
      send: jest.fn().mockResolvedValue({ delivered: true, providerName: 'IN_APP', sentAt: new Date() }),
    };

    emailProviderMock = {
      providerName: 'EMAIL',
      send: jest.fn().mockResolvedValue({ delivered: true, providerName: 'EMAIL', sentAt: new Date() }),
    };

    prismaMock = {
      notification: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      serviceRequest: { findUnique: jest.fn() },
      workOrder: { findUnique: jest.fn() },
      payment: { findUnique: jest.fn() },
      invoice: { findUnique: jest.fn() },
      user: { findMany: jest.fn() },
    };

    dispatcher = new NotificationDispatcherService(prismaMock, inAppProviderMock, emailProviderMock);
    notificationsService = new NotificationsService(prismaMock);
    eventListener = new NotificationEventListener(prismaMock, dispatcher);
  });

  describe('NotificationDispatcherService (Preference, Isolation, Idempotency)', () => {
    it('should dispatch notification to recipient via enabled providers', async () => {
      prismaMock.notification.findFirst.mockResolvedValue(null); // No duplicate

      const res = await dispatcher.dispatchToRecipient(
        { recipientId: 'u-1', recipientEmail: 'user1@nabs.com' },
        'Test Title',
        'Test Body',
        NotificationType.SYSTEM,
      );

      expect(res.delivered).toBe(true);
      expect(inAppProviderMock.send).toHaveBeenCalled();
      expect(emailProviderMock.send).toHaveBeenCalled();
    });

    it('should suppress duplicate notification delivery within 60s window (Idempotency)', async () => {
      prismaMock.notification.findFirst.mockResolvedValue({ id: 'existing-n1' }); // Duplicate exists

      const res = await dispatcher.dispatchToRecipient(
        { recipientId: 'u-1', recipientEmail: 'user1@nabs.com' },
        'Duplicate Title',
        'Body',
        NotificationType.SYSTEM,
      );

      expect(res.isDuplicate).toBe(true);
      expect(inAppProviderMock.send).not.toHaveBeenCalled();
    });

    it('should isolate recipient failure when dispatching to multiple recipients', async () => {
      prismaMock.notification.findFirst.mockResolvedValue(null);

      // InApp provider fails for 1 recipient but succeeds overall
      inAppProviderMock.send
        .mockResolvedValueOnce({ delivered: false, providerName: 'IN_APP', error: 'Database busy' })
        .mockResolvedValueOnce({ delivered: true, providerName: 'IN_APP' });

      const recipients = [
        { recipientId: 'u-1', recipientEmail: 'u1@nabs.com' },
        { recipientId: 'u-2', recipientEmail: 'u2@nabs.com' },
      ];

      const res = await dispatcher.dispatchToMultipleRecipients(recipients, 'Multi Title', 'Multi Body', NotificationType.WORK_ORDER_UPDATE);

      expect(res).toHaveLength(2);
    });
  });

  describe('NotificationsService (Unread Counter & Read Idempotency)', () => {
    it('should calculate unread notification count for user', async () => {
      prismaMock.notification.count.mockResolvedValue(5);

      const res = await notificationsService.getUnreadCount('u-1');

      expect(res.unreadCount).toBe(5);
    });

    it('should return idempotent success when marking an already read notification', async () => {
      prismaMock.notification.findFirst.mockResolvedValue({
        id: 'n-read',
        recipientId: 'u-1',
        isRead: true,
        title: 'Already read',
      });

      const res = await notificationsService.markAsRead('u-1', 'n-read');

      expect(res.isIdempotent).toBe(true);
      expect(prismaMock.notification.update).not.toHaveBeenCalled();
    });

    it('should mark unread notification as read setting readAt timestamp', async () => {
      prismaMock.notification.findFirst.mockResolvedValue({
        id: 'n-unread',
        recipientId: 'u-1',
        isRead: false,
        title: 'Unread notification',
      });
      prismaMock.notification.update.mockResolvedValue({
        id: 'n-unread',
        isRead: true,
        readAt: new Date(),
      });

      const res = await notificationsService.markAsRead('u-1', 'n-unread');

      expect(res.notification.isRead).toBe(true);
      expect(prismaMock.notification.update).toHaveBeenCalledWith({
        where: { id: 'n-unread' },
        data: expect.objectContaining({ isRead: true }),
        select: expect.any(Object),
      });
    });

    it('should forbid user from accessing notification belonging to another user', async () => {
      prismaMock.notification.findFirst.mockResolvedValue({
        id: 'n-other',
        recipientId: 'u-OTHER',
      });

      await expect(
        notificationsService.getNotificationById('u-1', 'n-other'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('NotificationEventListener (Domain Event Handling)', () => {
    it('should consume PAYMENT_SUCCESS domain event and dispatch notification', async () => {
      prismaMock.payment.findUnique.mockResolvedValue({
        paymentNumber: 'PAY-100',
        amount: '500.00',
        serviceRequest: { customer: { userId: 'u-cust', user: { email: 'cust@nabs.com' } } },
      });

      prismaMock.notification.findFirst.mockResolvedValue(null);

      await eventListener.handlePaymentSuccess({ paymentId: 'p-1' });

      expect(inAppProviderMock.send).toHaveBeenCalled();
    });
  });
});
