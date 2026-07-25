import { Invoice, InvoiceStatus, PrismaClient } from '@prisma/client';
import { SeededPayment } from './payments.seed';

export async function seedInvoices(
  prisma: PrismaClient,
  payments: SeededPayment[],
  targetInvoiceCount: number = 100,
): Promise<Invoice[]> {
  console.log(`📄 Seeding ${targetInvoiceCount} Financial Invoices...`);

  const seededInvoices: Invoice[] = [];

  for (let i = 0; i < Math.min(targetInvoiceCount, payments.length); i++) {
    const p = payments[i];
    const paymentStatus = p.payment.status;

    let status: InvoiceStatus = InvoiceStatus.PAID;
    let paidAmount = p.payment.amount;
    let dueAmount = 0;
    let dueDate: Date | null = new Date(p.payment.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);

    if (paymentStatus === 'PENDING' || paymentStatus === 'PROCESSING' || paymentStatus === 'FAILED') {
      status = InvoiceStatus.ISSUED;
      paidAmount = 0 as any;
      dueAmount = p.payment.amount as any;

      // Overdue invoice edge case (15 invoices with past due dates)
      if (i % 3 === 0) {
        dueDate = new Date('2026-05-15T00:00:00Z');
      }
    } else if (i % 20 === 0) {
      status = InvoiceStatus.DRAFT;
      paidAmount = 0 as any;
      dueAmount = p.payment.amount as any;
    }

    const year = i <= 50 ? '2025' : '2026';
    const invoiceNumber = `INV-${year}-${String(i + 1).padStart(4, '0')}`;
    const issuedAt = p.payment.createdAt;
    const pdfUrl = `/assets/invoices/${invoiceNumber}.pdf`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        paymentId: p.payment.id,
        status,
        totalAmount: p.payment.amount,
        paidAmount,
        dueAmount,
        dueDate,
        issuedAt,
        pdfUrl,
        createdAt: issuedAt,
      },
    });

    seededInvoices.push(invoice);
  }

  console.log(`✅ ${seededInvoices.length} Invoices seeded (including overdue invoices).`);
  return seededInvoices;
}
