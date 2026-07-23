import { ActivityRepository, VendorTimelineItem } from './ActivityRepository';

export class ActivityService {
  static async getVendorTimeline(): Promise<VendorTimelineItem[]> {
    return ActivityRepository.getVendorTimeline();
  }
}
