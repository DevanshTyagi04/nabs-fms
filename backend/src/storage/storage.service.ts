import { Inject, Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import { CleanupService } from './cleanup/cleanup.service';
import { STORAGE_PROVIDER_TOKEN } from './constants/storage.constant';
import { DownloadService } from './download/download.service';
import { IStorageProvider, ProviderHealthResult, StorageFileMetadata } from './providers/storage-provider.interface';
import { UploadOptions, UploadService } from './upload/upload.service';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly provider: IStorageProvider,
    private readonly uploadService: UploadService,
    private readonly downloadService: DownloadService,
    private readonly cleanupService: CleanupService,
  ) {}

  /**
   * Upload Buffer
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    options: UploadOptions,
  ) {
    return this.uploadService.uploadBuffer(fileBuffer, originalName, mimeType, options);
  }

  /**
   * Upload Stream (Bounded memory usage)
   */
  async uploadStream(
    fileStream: Readable,
    originalName: string,
    mimeType: string,
    options: UploadOptions,
  ) {
    return this.uploadService.uploadStream(fileStream, originalName, mimeType, options);
  }

  /**
   * Stream Download
   */
  async downloadStream(fileKey: string) {
    return this.downloadService.streamDownload(fileKey);
  }

  /**
   * Get File Metadata
   */
  async getMetadata(fileKey: string): Promise<StorageFileMetadata> {
    return this.downloadService.getMetadata(fileKey);
  }

  /**
   * Generate Download Signed URL
   */
  async generateSignedUrl(fileKey: string, expiresInSeconds = 3600): Promise<string> {
    return this.downloadService.generateSignedUrl(fileKey, expiresInSeconds);
  }

  /**
   * Delete File
   */
  async deleteFile(fileKey: string): Promise<boolean> {
    return this.cleanupService.deleteFile(fileKey);
  }

  /**
   * Recommendation 4: Provider Health Check
   */
  async checkHealth(): Promise<ProviderHealthResult> {
    return this.provider.healthCheck();
  }
}
