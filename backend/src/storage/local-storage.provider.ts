import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { IStorageProvider, UploadedFileMeta } from './storage.interface';

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

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    subFolder = 'avatars',
  ): Promise<UploadedFileMeta> {
    // Sanitize extension and generate cryptographically secure UUID filename
    const safeExt = path.extname(path.basename(originalName)).toLowerCase() || '.jpg';
    const safeFileName = `${randomUUID()}${safeExt}`;
    const targetDir = path.join(this.uploadBaseDir, subFolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, safeFileName);
    await fs.promises.writeFile(filePath, fileBuffer);

    const relativeUrl = `/uploads/${subFolder}/${safeFileName}`;

    this.logger.log(`File saved locally: ${filePath}`);

    return {
      fileName: safeFileName,
      originalName: path.basename(originalName),
      url: relativeUrl,
      mimeType,
      fileSize: fileBuffer.length,
    };
  }

  async deleteFile(fileUrlOrKey: string): Promise<boolean> {
    try {
      // Directory Traversal Defense: sanitize filename to basename only
      const fileName = path.basename(fileUrlOrKey);
      const subFolder = fileUrlOrKey.includes('/avatars/') ? 'avatars' : 'general';
      const fullPath = path.join(this.uploadBaseDir, subFolder, fileName);

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        this.logger.log(`Local file deleted safely: ${fullPath}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to delete local file safely: ${fileUrlOrKey}`, error);
      return false;
    }
  }

  async getFileUrl(fileKey: string): Promise<string> {
    if (fileKey.startsWith('/uploads/') || fileKey.startsWith('http')) {
      return fileKey;
    }
    return `/uploads/${fileKey}`;
  }
}
