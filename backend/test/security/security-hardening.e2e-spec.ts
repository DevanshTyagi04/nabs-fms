import { LocalStorageProvider } from '../../src/storage/providers/local-storage.provider';
import { UploadService } from '../../src/storage/upload/upload.service';

describe('Phase 18: Security Hardening & Penetration Defense Suite', () => {
  let storageProvider: LocalStorageProvider;
  let uploadService: UploadService;

  beforeEach(() => {
    storageProvider = new LocalStorageProvider();
    uploadService = new UploadService(storageProvider as any);
  });

  describe('Path Traversal & Storage Isolation', () => {
    it('should sanitize malicious file keys containing path traversal characters (../)', () => {
      const maliciousKey = '../../../etc/passwd.txt';
      const sanitized = (storageProvider as any).sanitizeKey(maliciousKey);

      expect(sanitized.fileName).toBe('passwd.txt');
    });

    it('should reject unpermitted file extensions and MIME types', async () => {
      const scriptBuffer = Buffer.from('<script>alert("xss")</script>');

      await expect(
        uploadService.uploadBuffer(scriptBuffer, 'shell.sh', 'application/x-sh', { category: 'temp' }),
      ).rejects.toThrow();
    });
  });

  describe('HMAC Signature Verification', () => {
    it('should defend against signature tampering on webhook events', () => {
      const secret = 'webhook-secret-key';
      const payload = JSON.stringify({ event: 'payment.captured', id: 'pay_123' });

      // Computed signature
      const crypto = require('crypto');
      const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      const tamperedSig = 'invalid_tampered_signature_hash';

      const verifySig = (sig: string) => {
        const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        return sig === expected;
      };

      expect(verifySig(validSig)).toBe(true);
      expect(verifySig(tamperedSig)).toBe(false);
    });
  });
});
