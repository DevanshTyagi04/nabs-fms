import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import {
  IStorageProvider,
  ProviderHealthResult,
  StorageFileMetadata,
} from './storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadBaseDir: string;

  constructor() {
    this.uploadBaseDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadBaseDir)) {
      fs.mkdirSync(this.uploadBaseDir, { recursive: true });
    }
  }

  /**
   * Helper: Sanitizes key to basename for path traversal defense
   */
  private sanitizeKey(fileKeyOrUrl: string): { subFolder: string; fileName: string } {
    const cleanPath = fileKeyOrUrl.replace(/^\/uploads\//, '');
    const parts = cleanPath.split('/').filter(Boolean);

    if (parts.length > 1) {
      const subFolder = path.basename(parts[0]);
      const fileName = path.basename(parts[parts.length - 1]);
      return { subFolder, fileName };
    }

    return { subFolder: 'general', fileName: path.basename(cleanPath) };
  }

  /**
   * Backward-compatible alias for existing modules
   */
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
    const targetDir = path.join(this.uploadBaseDir, subFolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, safeFileName);
    const writeStream = fs.createWriteStream(filePath);
    const hash = createHash('sha256');

    let totalSize = 0;

    await new Promise((resolve, reject) => {
      fileStream.on('data', (chunk) => {
        totalSize += chunk.length;
        hash.update(chunk);
      });
      fileStream.pipe(writeStream);
      writeStream.on('finish', () => resolve(true));
      writeStream.on('error', (err) => reject(err));
      fileStream.on('error', (err) => reject(err));
    });

    const checksum = hash.digest('hex');
    const objectKey = `${subFolder}/${safeFileName}`;
    const url = `/uploads/${objectKey}`;

    this.logger.log(`File saved locally via stream: ${filePath} (${totalSize} bytes)`);

    return {
      objectKey,
      originalFilename: path.basename(originalName),
      contentType: mimeType,
      size: totalSize,
      checksum,
      lastModified: new Date(),
      url,
    };
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
    const metadata = await this.getFileMetadata(fileKey);
    const { subFolder, fileName } = this.sanitizeKey(fileKey);
    const fullPath = path.join(this.uploadBaseDir, subFolder, fileName);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found on local storage: [${fileKey}]`);
    }

    const stream = fs.createReadStream(fullPath);
    return { stream, metadata };
  }

  async getFileMetadata(fileKey: string): Promise<StorageFileMetadata> {
    const { subFolder, fileName } = this.sanitizeKey(fileKey);
    const fullPath = path.join(this.uploadBaseDir, subFolder, fileName);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: [${fileKey}]`);
    }

    const stats = await fs.promises.stat(fullPath);
    const objectKey = `${subFolder}/${fileName}`;
    const url = `/uploads/${objectKey}`;

    return {
      objectKey,
      originalFilename: fileName,
      contentType: 'application/octet-stream',
      size: stats.size,
      lastModified: stats.mtime,
      url,
    };
  }

  async generateSignedUrl(fileKey: string, expiresInSeconds = 3600): Promise<string> {
    const { subFolder, fileName } = this.sanitizeKey(fileKey);
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    return `/uploads/${subFolder}/${fileName}?expires=${expiresAt}&signature=mock-local-sig`;
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const { subFolder, fileName } = this.sanitizeKey(fileKey);
      const fullPath = path.join(this.uploadBaseDir, subFolder, fileName);

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        this.logger.log(`Local file deleted safely: ${fullPath}`);
        return true;
      }
      return false;
    } catch (error: any) {
      this.logger.error(`Failed to delete local file: ${fileKey}`, error);
      return false;
    }
  }

  async exists(fileKey: string): Promise<boolean> {
    const { subFolder, fileName } = this.sanitizeKey(fileKey);
    const fullPath = path.join(this.uploadBaseDir, subFolder, fileName);
    return fs.existsSync(fullPath);
  }

  async healthCheck(): Promise<ProviderHealthResult> {
    try {
      await fs.promises.access(this.uploadBaseDir, fs.constants.W_OK);
      return {
        isHealthy: true,
        providerType: 'LOCAL_STORAGE',
        details: { baseDir: this.uploadBaseDir, writable: true },
      };
    } catch (error: any) {
      return {
        isHealthy: false,
        providerType: 'LOCAL_STORAGE',
        details: { baseDir: this.uploadBaseDir, error: error.message },
      };
    }
  }
}
