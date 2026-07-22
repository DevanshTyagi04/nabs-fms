import { Inject, Injectable, Logger } from '@nestjs/common';
import { STORAGE_PROVIDER_TOKEN } from '../constants/storage.constant';
import { IStorageProvider } from '../providers/storage-provider.interface';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly provider: IStorageProvider,
  ) {}

  /**
   * Recommendation 2: Storage Consistency & Orphan Recovery
   * Purges unreferenced storage object
   */
  async deleteFile(fileKey: string): Promise<boolean> {
    this.logger.log(`Executing deletion for storage key: [${fileKey}]`);
    return this.provider.deleteFile(fileKey);
  }

  /**
   * Scans and purges temporary files older than retention period
   */
  async purgeTempFiles(tempFileKeys: string[]): Promise<{ purged: number; failed: number }> {
    let purged = 0;
    let failed = 0;

    for (const key of tempFileKeys) {
      try {
        const success = await this.provider.deleteFile(key);
        if (success) purged++;
        else failed++;
      } catch (error) {
        failed++;
      }
    }

    this.logger.log(`Temp files cleanup completed. Purged: ${purged}, Failed: ${failed}`);
    return { purged, failed };
  }
}
