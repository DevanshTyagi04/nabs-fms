import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, STORAGE_CATEGORY, STORAGE_PROVIDER_TOKEN } from '../constants/storage.constant';
import { IStorageProvider, StorageFileMetadata } from '../providers/storage-provider.interface';

export interface UploadOptions {
  category: 'avatars' | 'attachments' | 'invoices' | 'temp';
  customOldFileKeyToDelete?: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly provider: IStorageProvider,
  ) {}

  /**
   * Validates file size, category, and MIME types
   */
  private validateFile(fileBuffer: Buffer | Readable, originalName: string, mimeType: string, category: string) {
    if (!originalName || originalName.trim().length === 0) {
      throw new BadRequestException('Invalid original filename');
    }

    let allowedMimes: readonly string[] = ALLOWED_MIME_TYPES.ATTACHMENT;
    let maxSize = MAX_FILE_SIZE_BYTES.ATTACHMENT;

    if (category === STORAGE_CATEGORY.AVATAR) {
      allowedMimes = ALLOWED_MIME_TYPES.AVATAR;
      maxSize = MAX_FILE_SIZE_BYTES.AVATAR;
    } else if (category === STORAGE_CATEGORY.INVOICE) {
      allowedMimes = ALLOWED_MIME_TYPES.INVOICE;
      maxSize = MAX_FILE_SIZE_BYTES.INVOICE;
    }

    if (!allowedMimes.includes(mimeType)) {
      throw new BadRequestException(`MIME type [${mimeType}] is not allowed for category [${category}]`);
    }

    if (Buffer.isBuffer(fileBuffer) && fileBuffer.length > maxSize) {
      throw new BadRequestException(`File size [${fileBuffer.length} bytes] exceeds max permitted size [${maxSize} bytes] for category [${category}]`);
    }
  }

  /**
   * Upload Buffer with validation and Atomic Replacement (Recommendation 1)
   */
  async uploadBuffer(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    options: UploadOptions,
  ): Promise<{ metadata: StorageFileMetadata; oldFileQueuedForDeletion?: string }> {
    this.validateFile(fileBuffer, originalName, mimeType, options.category);

    // 1. Upload new file first
    const metadata = await this.provider.uploadBuffer(
      fileBuffer,
      originalName,
      mimeType,
      options.category,
    );

    let oldFileQueuedForDeletion: string | undefined;

    // Recommendation 1: Atomic File Replacement - Delete old object ONLY AFTER new upload succeeds
    if (options.customOldFileKeyToDelete) {
      try {
        await this.provider.deleteFile(options.customOldFileKeyToDelete);
        oldFileQueuedForDeletion = options.customOldFileKeyToDelete;
        this.logger.log(`Old file [${options.customOldFileKeyToDelete}] safely deleted after atomic replacement.`);
      } catch (error: any) {
        this.logger.warn(`Failed to delete old file [${options.customOldFileKeyToDelete}] during replacement: ${error.message}`);
      }
    }

    return { metadata, oldFileQueuedForDeletion };
  }

  /**
   * Upload Stream with validation
   */
  async uploadStream(
    fileStream: Readable,
    originalName: string,
    mimeType: string,
    options: UploadOptions,
  ): Promise<StorageFileMetadata> {
    this.validateFile(fileStream, originalName, mimeType, options.category);
    return this.provider.uploadStream(fileStream, originalName, mimeType, options.category);
  }
}
