import { SessionManager } from '@/auth/services/SessionManager';
import { Invoice, InvoiceFilters, InvoiceListResult } from '../types';
import { FinancialEngine } from '@/financial/core/FinancialEngine';

export class InvoiceRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockDatabase: Invoice[] = [
    {
      id: 'inv-5001',
      invoiceNumber: 'INV-20260723-5001',
      workOrderId: 'wo-4001',
      serviceRequestId: 'sr-1001',
      estimateId: 'est-3001',
      ticketNumber: 'SR-20260723-1001',
      vendorId: 'usr-vendor-01',
      vendorName: 'Apex Field Services LLC',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      status: 'ISSUED',
      subtotal: 385.0,
      taxTotal: 47.45,
      discountTotal: 20.0,
      grandTotal: 412.45,
      amountDue: 412.45,
      dueDate: '2026-08-22',
      pdfUrl: '/api/v1/documents/INV-20260723-5001.pdf',
      items: [
        { id: 'item-1', description: '45uF 440V Dual Run Capacitor', quantity: 1, unitPrice: 85.0, taxRate: 13, discountAmount: 0 },
        { id: 'item-2', description: 'HVAC Technician Field Labor (2.5 hrs)', quantity: 2.5, unitPrice: 120.0, taxRate: 13, discountAmount: 20 },
      ],
      totals: FinancialEngine.calculate([
        { id: 'item-1', description: '45uF 440V Dual Run Capacitor', quantity: 1, unitPrice: 85.0, taxRate: 13, discountAmount: 0 },
        { id: 'item-2', description: 'HVAC Technician Field Labor (2.5 hrs)', quantity: 2.5, unitPrice: 120.0, taxRate: 13, discountAmount: 20 },
      ]).totals,
      linkedEntities: [
        { id: 'wo-4001', type: 'SERVICE_REQUEST', label: 'Completed Work Order', referenceNumber: 'WO-20260723-4001', status: 'VERIFIED' },
        { id: 'est-3001', type: 'ESTIMATE', label: 'Approved Quotation Estimate', referenceNumber: 'EST-3001', status: 'APPROVED' },
        { id: 'sr-1001', type: 'SERVICE_REQUEST', label: 'Original Service Ticket', referenceNumber: 'SR-20260723-1001', status: 'COMPLETED' },
      ],
      createdAt: '2026-07-23T11:00:00Z',
      updatedAt: '2026-07-23T11:15:00Z',
    },
    {
      id: 'inv-5002',
      invoiceNumber: 'INV-20260722-5002',
      workOrderId: 'wo-4002',
      serviceRequestId: 'sr-1002',
      estimateId: 'est-3002',
      ticketNumber: 'SR-20260722-1002',
      vendorId: 'usr-vendor-02',
      vendorName: 'ProPlumb Solutions Inc.',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      status: 'PAID',
      subtotal: 450.0,
      taxTotal: 52.0,
      discountTotal: 50.0,
      grandTotal: 452.0,
      amountDue: 0.0,
      dueDate: '2026-08-21',
      pdfUrl: '/api/v1/documents/INV-20260722-5002.pdf',
      items: [
        { id: 'item-1', description: 'Commercial Hydro-Jetting Service', quantity: 1, unitPrice: 450.0, taxRate: 13, discountAmount: 50 },
      ],
      totals: FinancialEngine.calculate([
        { id: 'item-1', description: 'Commercial Hydro-Jetting Service', quantity: 1, unitPrice: 450.0, taxRate: 13, discountAmount: 50 },
      ]).totals,
      linkedEntities: [
        { id: 'wo-4002', type: 'SERVICE_REQUEST', label: 'Completed Work Order', referenceNumber: 'WO-20260722-4002', status: 'VERIFIED' },
        { id: 'est-3002', type: 'ESTIMATE', label: 'Approved Quotation Estimate', referenceNumber: 'EST-3002', status: 'APPROVED' },
      ],
      createdAt: '2026-07-22T18:00:00Z',
      updatedAt: '2026-07-22T18:30:00Z',
    },
  ];

  static async listInvoices(filters: InvoiceFilters): Promise<InvoiceListResult> {
    try {
      const client = this.getClient();
      const res = await client.invoices.getAllAdmin(filters);
      if (res.data?.items) {
        return {
          items: res.data.items.map((item) => {
            const rawItems = item.items.map((i) => ({
              id: i.id,
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              taxRate: i.taxRate || 13,
              discountAmount: i.discountAmount || 0,
            }));
            const calc = FinancialEngine.calculate(rawItems);
            return {
              id: item.id,
              invoiceNumber: item.invoiceNumber,
              workOrderId: item.workOrderId,
              serviceRequestId: item.serviceRequestId,
              estimateId: item.estimateId,
              ticketNumber: item.ticketNumber || 'SR-20260723-1001',
              vendorId: item.vendorId,
              vendorName: item.vendorName || 'Assigned Vendor',
              customerId: item.customerId,
              customerName: item.customerName || 'Customer Account',
              status: item.status as any,
              subtotal: item.subtotal,
              taxTotal: item.taxTotal,
              discountTotal: item.discountTotal,
              grandTotal: item.grandTotal,
              amountDue: item.amountDue,
              dueDate: item.dueDate,
              pdfUrl: item.pdfUrl,
              items: calc.calculatedItems,
              totals: calc.totals,
              linkedEntities: [
                { id: item.workOrderId, type: 'SERVICE_REQUEST', label: 'Work Order', referenceNumber: item.workOrderId, status: item.status },
              ],
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            };
          }),
          total: res.data.total,
        };
      }
    } catch {
      // Fallback
    }

    let items = [...this.mockDatabase];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.ticketNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          inv.vendorName.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      items = items.filter((inv) => inv.status === filters.status);
    }

    const total = items.length;
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginated = items.slice(startIndex, startIndex + filters.pageSize);

    return { items: paginated, total };
  }

  static async getById(id: string): Promise<Invoice | null> {
    const found = this.mockDatabase.find((inv) => inv.id === id);
    return found || null;
  }

  static async cancelInvoice(id: string): Promise<Invoice> {
    const index = this.mockDatabase.findIndex((inv) => inv.id === id);
    if (index === -1) throw new Error('Invoice not found');

    const updated: Invoice = {
      ...this.mockDatabase[index],
      status: 'CANCELLED',
      updatedAt: new Date().toISOString(),
    };
    this.mockDatabase[index] = updated;
    return updated;
  }
}
