import { NotificationRepository, CustomerNotification } from './NotificationRepository';

export class NotificationService {
  static async getCustomerNotifications(): Promise<CustomerNotification[]> {
    return NotificationRepository.getCustomerNotifications();
  }
}
