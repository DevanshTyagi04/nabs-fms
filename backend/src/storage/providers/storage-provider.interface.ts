import { Readable } from 'stream';

export interface StorageFileMetadata {
  objectKey: string;
  originalFilename: string;
  contentType: string;
  size: number;
  checksum?: string;
  lastModified: Date;
  url: string;
}

export interface ProviderHealthResult {
  isHealthy: boolean;
  providerType: string;
  details: Record<string, any>;
}

export interface IStorageProvider {
  /**
   * Backward-compatible alias for uploadBuffer
   */
  uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    subFolder?: string,
  ): Promise<{ fileName: string; originalName: string; url: string; mimeType: string; fileSize: number; objectKey?: string }>;

  /**
   * Upload file from Readable stream for bounded memory usage
   */
  uploadStream(
    fileStream: Readable,
    originalName: string,
    mimeType: string,
    subFolder?: string,
  ): Promise<StorageFileMetadata>;

  /**
   * Upload file from Buffer
   */
  uploadBuffer(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    subFolder?: string,
  ): Promise<StorageFileMetadata>;

  /**
   * Stream download for true zero-memory buffering
   */
  downloadStream(
    fileKey: string,
  ): Promise<{ stream: Readable; metadata: StorageFileMetadata }>;

  /**
   * Retrieve standardized metadata
   */
  getFileMetadata(fileKey: string): Promise<StorageFileMetadata>;

  /**
   * Provider-independent signed download URL generation
   */
  generateSignedUrl(
    fileKey: string,
    expiresInSeconds?: number,
  ): Promise<string>;

  /**
   * Safely delete file
   */
  deleteFile(fileKey: string): Promise<boolean>;

  /**
   * Check if file exists
   */
  exists(fileKey: string): Promise<boolean>;

  /**
   * Recommendation 4: Provider Health Check
   */
  healthCheck(): Promise<ProviderHealthResult>;
}
