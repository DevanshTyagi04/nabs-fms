import { NotificationRepository } from './NotificationRepository';
import { NotificationItemDomain, NotificationFilters, NotificationListResult } from '../types';

export class NotificationService {
  static async listNotifications(filters: NotificationFilters): Promise<NotificationListResult> {
    return NotificationRepository.listNotifications(filters);
  }

  static async getUnreadCount(): Promise<number> {
    return NotificationRepository.getUnreadCount();
  }

  static async markAsRead(id: string): Promise<NotificationItemDomain> {
    return NotificationRepository.markAsRead(id);
  }

  static async markAllAsRead(): Promise<number> {
    return NotificationRepository.markAllAsRead();
  }
}
