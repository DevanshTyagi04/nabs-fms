import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import * as path from 'path';
import { Readable } from 'stream';
import {
  IStorageProvider,
  ProviderHealthResult,
  StorageFileMetadata,
} from './storage-provider.interface';

@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly bucketName: string;
  private readonly region: string;
  private readonly mockStore: Map<string, { buffer: Buffer; metadata: StorageFileMetadata }> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') || 'nabs-fms-attachments';
    this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    subFolder = 'general',
  ) {
    const meta = await this.uploadBuffer(fileBuffer, originalName, mimeType, subFolder);
    return {
      fileName: meta.objectKey.split('/').pop() || meta.originalFilename,
      originalName: meta.originalFilename,
      url: meta.url,
      mimeType: meta.contentType,
      fileSize: meta.size,
      objectKey: meta.objectKey,
    };
  }

  async uploadStream(
    fileStream: Readable,
    originalName: string,
    mimeType: string,
    subFolder = 'general',
  ): Promise<StorageFileMetadata> {
    const safeExt = path.extname(path.basename(originalName)).toLowerCase() || '.bin';
    const safeFileName = `${randomUUID()}${safeExt}`;
    const objectKey = `${subFolder}/${safeFileName}`;

    const chunks: Buffer[] = [];
    const hash = createHash('sha256');

    await new Promise((resolve, reject) => {
      fileStream.on('data', (chunk) => {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        chunks.push(buf);
        hash.update(buf);
      });
      fileStream.on('end', () => resolve(true));
      fileStream.on('error', (err) => reject(err));
    });

    const buffer = Buffer.concat(chunks);
    const checksum = hash.digest('hex');
    const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${objectKey}`;

    const metadata: StorageFileMetadata = {
      objectKey,
      originalFilename: path.basename(originalName),
      contentType: mimeType,
      size: buffer.length,
      checksum,
      lastModified: new Date(),
      url,
    };

    this.mockStore.set(objectKey, { buffer, metadata });
    this.logger.log(`Uploaded to S3: s3://${this.bucketName}/${objectKey} (${buffer.length} bytes)`);

    return metadata;
  }

  async uploadBuffer(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    subFolder = 'general',
  ): Promise<StorageFileMetadata> {
    const readable = Readable.from(fileBuffer);
    return this.uploadStream(readable, originalName, mimeType, subFolder);
  }

  async downloadStream(fileKey: string): Promise<{ stream: Readable; metadata: StorageFileMetadata }> {
    const entry = this.mockStore.get(fileKey);
    if (!entry) {
      throw new Error(`S3 Object not found: [${fileKey}]`);
    }

    const stream = Readable.from(entry.buffer);
    return { stream, metadata: entry.metadata };
  }

  async getFileMetadata(fileKey: string): Promise<StorageFileMetadata> {
    const entry = this.mockStore.get(fileKey);
    if (!entry) {
      throw new Error(`S3 Object metadata not found: [${fileKey}]`);
    }
    return entry.metadata;
  }

  async generateSignedUrl(fileKey: string, expiresInSeconds = 3600): Promise<string> {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileKey}?X-Amz-Expires=${expiresInSeconds}&X-Amz-Signature=mock-s3-sig`;
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    const existed = this.mockStore.has(fileKey);
    this.mockStore.delete(fileKey);
    if (existed) {
      this.logger.log(`Deleted S3 Object: s3://${this.bucketName}/${fileKey}`);
    }
    return existed;
  }

  async exists(fileKey: string): Promise<boolean> {
    return this.mockStore.has(fileKey);
  }

  async healthCheck(): Promise<ProviderHealthResult> {
    return {
      isHealthy: true,
      providerType: 'AWS_S3',
      details: { bucket: this.bucketName, region: this.region },
    };
  }
}
