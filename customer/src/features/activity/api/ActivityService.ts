import { ActivityRepository, CustomerTimelineItem } from './ActivityRepository';

export class ActivityService {
  static async getCustomerTimeline(): Promise<CustomerTimelineItem[]> {
    return ActivityRepository.getCustomerTimeline();
  }
}
