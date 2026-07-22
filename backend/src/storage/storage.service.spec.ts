import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { CleanupService } from './cleanup/cleanup.service';
import { DownloadService } from './download/download.service';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { UploadService } from './upload/upload.service';

describe('File & Storage Management Module (Phase 14 Unit & Integration Tests)', () => {
  let localProvider: LocalStorageProvider;
  let s3Provider: S3StorageProvider;
  let uploadService: UploadService;
  let downloadService: DownloadService;
  let cleanupService: CleanupService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'STORAGE_PROVIDER') return 'local';
        if (key === 'AWS_S3_BUCKET') return 'test-bucket';
        if (key === 'AWS_REGION') return 'us-east-1';
        return null;
      }),
    } as any;

    localProvider = new LocalStorageProvider();
    s3Provider = new S3StorageProvider(configService);
    uploadService = new UploadService(localProvider);
    downloadService = new DownloadService(localProvider);
    cleanupService = new CleanupService(localProvider);
  });

  describe('LocalStorageProvider (Streaming, Security, & Path Traversal)', () => {
    it('should upload buffer and return standardized metadata contract', async () => {
      const buffer = Buffer.from('Test File Content');
      const meta = await localProvider.uploadBuffer(buffer, 'test-doc.png', 'image/png', 'temp');

      expect(meta.objectKey).toContain('temp/');
      expect(meta.originalFilename).toBe('test-doc.png');
      expect(meta.contentType).toBe('image/png');
      expect(meta.size).toBe(buffer.length);
      expect(meta.checksum).toBeDefined();

      // Clean up test file
      await localProvider.deleteFile(meta.objectKey);
    });

    it('should defend against Path Traversal attacks by isolating file keys', async () => {
      const maliciousKey = '../../etc/passwd.txt';
      await expect(localProvider.downloadStream(maliciousKey)).rejects.toThrow('File not found');
    });

    it('should pass health check for local storage directory', async () => {
      const health = await localProvider.healthCheck();
      expect(health.isHealthy).toBe(true);
    });
  });

  describe('S3StorageProvider (Cloud Storage & Signed URLs)', () => {
    it('should upload stream, generate signed download URL, and pass health check', async () => {
      const stream = Readable.from(Buffer.from('Cloud Invoice Data'));
      const meta = await s3Provider.uploadStream(stream, 'inv-99.pdf', 'application/pdf', 'invoices');

      expect(meta.objectKey).toContain('invoices/');
      expect(meta.url).toBeDefined();

      const signedUrl = await s3Provider.generateSignedUrl(meta.objectKey, 3600);
      expect(signedUrl).toContain('X-Amz-Signature');

      const health = await s3Provider.healthCheck();
      expect(health.isHealthy).toBe(true);
    });
  });

  describe('UploadService (Validation & Atomic Replacement)', () => {
    it('should reject invalid MIME types with BadRequestException', async () => {
      await expect(
        uploadService.uploadBuffer(Buffer.from('EXE'), 'malware.exe', 'application/x-msdownload', { category: 'temp' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject files exceeding max permitted size', async () => {
      const hugeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB (Avatar limit 5MB)
      await expect(
        uploadService.uploadBuffer(hugeBuffer, 'huge.jpg', 'image/jpeg', { category: 'avatars' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should perform Atomic File Replacement (upload new before deleting old)', async () => {
      const oldUpload = await localProvider.uploadBuffer(Buffer.from('Old Avatar'), 'old.jpg', 'image/jpeg', 'avatars');
      const newBuffer = Buffer.from('New Avatar');

      const replacement = await uploadService.uploadBuffer(
        newBuffer,
        'new.jpg',
        'image/jpeg',
        { category: 'avatars', customOldFileKeyToDelete: oldUpload.objectKey },
      );

      expect(replacement.metadata.objectKey).not.toBe(oldUpload.objectKey);
      expect(replacement.oldFileQueuedForDeletion).toBe(oldUpload.objectKey);

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

      // Safely close read stream before deletion
      res.stream.destroy();
      await new Promise((resolve) => setTimeout(resolve, 50));

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

      const cleanupRes = await cleanupService.purgeTempFiles([f1.objectKey, f2.objectKey]);
      expect(cleanupRes.purged).toBe(2);
      expect(cleanupRes.failed).toBe(0);
    });
  });
});
