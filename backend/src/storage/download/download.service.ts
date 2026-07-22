import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import { STORAGE_PROVIDER_TOKEN } from '../constants/storage.constant';
import { IStorageProvider, StorageFileMetadata } from '../providers/storage-provider.interface';

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  constructor(
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly provider: IStorageProvider,
  ) {}

  /**
   * Recommendation 3: Stream download for true zero-memory buffering
   */
  async streamDownload(fileKey: string): Promise<{ stream: Readable; metadata: StorageFileMetadata; contentDisposition: string }> {
    try {
      const { stream, metadata } = await this.provider.downloadStream(fileKey);
      const safeFilename = encodeURIComponent(metadata.originalFilename);
      const contentDisposition = `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`;

      this.logger.log(`Stream download requested for fileKey [${fileKey}] (${metadata.size} bytes)`);

      return { stream, metadata, contentDisposition };
    } catch (error: any) {
      this.logger.error(`Download failed for fileKey [${fileKey}]: ${error.message}`);
      throw new NotFoundException(`File not found or inaccessible: [${fileKey}]`);
    }
  }

  /**
   * Retrieves provider-independent file metadata
   */
  async getMetadata(fileKey: string): Promise<StorageFileMetadata> {
    try {
      return await this.provider.getFileMetadata(fileKey);
    } catch (error: any) {
      throw new NotFoundException(`File metadata not found for key: [${fileKey}]`);
    }
  }

  /**
   * Provider-independent signed download URL generation
   */
  async generateSignedUrl(fileKey: string, expiresInSeconds = 3600): Promise<string> {
    const exists = await this.provider.exists(fileKey);
    if (!exists) {
      throw new NotFoundException(`File not found for signed URL generation: [${fileKey}]`);
    }
    return this.provider.generateSignedUrl(fileKey, expiresInSeconds);
  }
}
