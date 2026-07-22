import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import { QueryNotificationDto } from './dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves paginated notifications for the authenticated user
   */
  async getUserNotifications(userId: string, query: QueryNotificationDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      recipientId: userId,
      ...(query.isRead !== undefined && { isRead: query.isRead }),
      ...(query.type && { type: query.type }),
    };

    const [total, notifications] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          title: true,
          body: true,
          type: true,
          deliveryStatus: true,
          isRead: true,
          sentAt: true,
          readAt: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      message: 'Notifications retrieved successfully',
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Calculates total unread notification count for current user
   */
  async getUnreadCount(userId: string) {
    const unreadCount = await this.prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    return {
      message: 'Unread notification count calculated successfully',
      unreadCount,
    };
  }

  /**
   * Retrieves single notification details enforcing ownership
   */
  async getNotificationById(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId },
      select: {
        id: true,
        recipientId: true,
        title: true,
        body: true,
        type: true,
        deliveryStatus: true,
        isRead: true,
        sentAt: true,
        readAt: true,
        createdAt: true,
      },
    });

    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.recipientId !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }

    return {
      message: 'Notification details retrieved successfully',
      notification,
    };
  }

  /**
   * Marks a single notification as read (Idempotent implementation)
   */
  async markAsRead(userId: string, notificationId: string) {
    const { notification } = await this.getNotificationById(userId, notificationId);

    // IDEMPOTENCY PROTECTION (Recommendation 5): Ignore if already read
    if (notification.isRead) {
      return {
        message: 'Notification already marked as read',
        notification,
        isIdempotent: true,
      };
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        isRead: true,
        readAt: true,
      },
    });

    this.logger.log(`[AUDIT_EVENT] [NOTIFICATION_READ] User: [${userId}] Notification: [${notificationId}]`);

    return {
      message: 'Notification marked as read successfully',
      notification: updated,
    };
  }

  /**
   * Marks all notifications for current user as read (Idempotent implementation)
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (result.count > 0) {
      this.logger.log(`[AUDIT_EVENT] [NOTIFICATION_READ] User: [${userId}] Count: [${result.count}]`);
    }

    return {
      message: 'All notifications marked as read successfully',
      count: result.count,
    };
  }

  // ==============================================================================
  // ADMIN OPERATIONS
  // ==============================================================================

  /**
   * Admin lists all platform notification delivery logs
   */
  async getAllNotificationsAdmin(query: QueryNotificationDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      ...(query.isRead !== undefined && { isRead: query.isRead }),
      ...(query.type && { type: query.type }),
    };

    const [total, notifications] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          recipientId: true,
          recipient: { select: { email: true, role: true } },
          title: true,
          body: true,
          type: true,
          deliveryStatus: true,
          isRead: true,
          sentAt: true,
          readAt: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      message: 'All platform notification logs retrieved successfully',
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
