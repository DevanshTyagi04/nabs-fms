import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import { CleanupService } from './cleanup/cleanup.service';
import { STORAGE_CATEGORY } from './constants/storage.constant';
import { DownloadService } from './download/download.service';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { StorageService } from './storage.service';
import { UploadService } from './upload/upload.service';

describe('File & Storage Management Module (Phase 14 Unit & Integration Tests)', () => {
  let storageService: StorageService;
  let localProvider: LocalStorageProvider;
  let s3Provider: S3StorageProvider;
  let uploadService: UploadService;
  let downloadService: DownloadService;
  let cleanupService: CleanupService;
  let configServiceMock: any;

  beforeEach(() => {
    configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'AWS_BUCKET_NAME') return 'test-bucket';
        if (key === 'AWS_REGION') return 'us-east-1';
        return null;
      }),
    };

    localProvider = new LocalStorageProvider();
    s3Provider = new S3StorageProvider(configServiceMock);
    uploadService = new UploadService(localProvider);
    downloadService = new DownloadService(localProvider);
    cleanupService = new CleanupService(localProvider);
    storageService = new StorageService(localProvider, uploadService, downloadService, cleanupService);
  });

  describe('LocalStorageProvider (Streaming, Security, & Path Traversal)', () => {
    it('should upload buffer and return standardized metadata contract', async () => {
      const buffer = Buffer.from('Hello Storage World');
      const meta = await localProvider.uploadBuffer(buffer, 'test.png', 'image/png', 'temp');

      expect(meta.objectKey).toContain('temp/');
      expect(meta.originalFilename).toBe('test.png');
      expect(meta.size).toBe(buffer.length);
      expect(meta.checksum).toBeDefined();

      // Clean up test file
      await localProvider.deleteFile(meta.objectKey);
    });

    it('should sanitize fileKey and defend against Path Traversal attacks', async () => {
      const maliciousKey = '../../../../etc/passwd';
      const exists = await localProvider.exists(maliciousKey);
      expect(exists).toBe(false);
    });

    it('should pass health check for local storage directory', async () => {
      const health = await localProvider.healthCheck();
      expect(health.isHealthy).toBe(true);
      expect(health.providerType).toBe('LOCAL_STORAGE');
    });
  });

  describe('S3StorageProvider (Cloud Storage & Signed URLs)', () => {
    it('should upload stream, generate signed download URL, and pass health check', async () => {
      const stream = Readable.from(['Cloud S3 Content']);
      const meta = await s3Provider.uploadStream(stream, 'document.pdf', 'application/pdf', 'invoices');

      expect(meta.url).toContain('https://test-bucket.s3.us-east-1.amazonaws.com/');

      const signedUrl = await s3Provider.generateSignedUrl(meta.objectKey);
      expect(signedUrl).toContain('X-Amz-Expires=3600');

      const health = await s3Provider.healthCheck();
      expect(health.isHealthy).toBe(true);
      expect(health.providerType).toBe('AWS_S3');
    });
  });

  describe('UploadService (Validation & Atomic Replacement)', () => {
    it('should reject invalid MIME types with BadRequestException', async () => {
      const buffer = Buffer.from('executable script');
      await expect(
        uploadService.uploadBuffer(buffer, 'script.exe', 'application/x-msdownload', {
          category: STORAGE_CATEGORY.AVATAR,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject files exceeding max permitted size', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB > 5MB limit
      await expect(
        uploadService.uploadBuffer(largeBuffer, 'large.jpg', 'image/jpeg', {
          category: STORAGE_CATEGORY.AVATAR,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should perform Atomic File Replacement (upload new before deleting old)', async () => {
      // 1. Upload initial file
      const initial = await uploadService.uploadBuffer(Buffer.from('Old Avatar'), 'old.jpg', 'image/jpeg', {
        category: STORAGE_CATEGORY.AVATAR,
      });

      // 2. Replace atomically
      const replacement = await uploadService.uploadBuffer(Buffer.from('New Avatar'), 'new.jpg', 'image/jpeg', {
        category: STORAGE_CATEGORY.AVATAR,
        customOldFileKeyToDelete: initial.metadata.objectKey,
      });

      expect(replacement.metadata.objectKey).not.toBe(initial.metadata.objectKey);
      expect(replacement.oldFileQueuedForDeletion).toBe(initial.metadata.objectKey);

      // Verify old file is gone
      const oldExists = await localProvider.exists(initial.metadata.objectKey);
      expect(oldExists).toBe(false);

      // Clean up new file
      await localProvider.deleteFile(replacement.metadata.objectKey);
    });
  });

  describe('DownloadService (Streams & Content-Disposition)', () => {
    it('should return true stream download with formatted Content-Disposition header', async () => {
      const upload = await localProvider.uploadBuffer(Buffer.from('Invoice PDF'), 'invoice-100.pdf', 'application/pdf', 'invoices');

      const res = await downloadService.streamDownload(upload.objectKey);
      expect(res.stream).toBeDefined();
      expect(res.contentDisposition).toContain('attachment; filename=');

      // Clean up
      await localProvider.deleteFile(upload.objectKey);
    });

    it('should throw NotFoundException if requested fileKey does not exist', async () => {
      await expect(downloadService.streamDownload('non-existent-key.pdf')).rejects.toThrow(NotFoundException);
    });
  });

  describe('CleanupService (Purging & Maintenance)', () => {
    it('should purge list of temporary files', async () => {
      const f1 = await localProvider.uploadBuffer(Buffer.from('T1'), 't1.tmp', 'image/png', 'temp');
      const f2 = await localProvider.uploadBuffer(Buffer.from('T2'), 't2.tmp', 'image/png', 'temp');

      const result = await cleanupService.purgeTempFiles([f1.objectKey, f2.objectKey]);
      expect(result.purged).toBe(2);
    });
  });
});
