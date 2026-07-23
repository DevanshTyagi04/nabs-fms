import { NotificationRepository, VendorNotification } from './NotificationRepository';

export class NotificationService {
  static async getVendorNotifications(): Promise<VendorNotification[]> {
    return NotificationRepository.getVendorNotifications();
  }
}
