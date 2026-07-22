import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma';

@Injectable()
export class InvoiceNumberService {
  private readonly logger = new Logger(InvoiceNumberService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a collision-safe invoice number (INV-YYYYMMDD-XXXX)
   */
  async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      const randomSuffix = randomBytes(2).toString('hex').toUpperCase();
      const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

      const existing = await this.prisma.invoice.findUnique({
        where: { invoiceNumber },
        select: { id: true },
      });

      if (!existing) {
        return invoiceNumber;
      }
    }

    throw new Error('Failed to generate a unique invoice number. Maximum retries exceeded.');
  }
}
