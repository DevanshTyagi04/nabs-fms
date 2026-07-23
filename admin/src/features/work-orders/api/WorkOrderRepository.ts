import { SessionManager } from '@/auth/services/SessionManager';
import { WorkOrder, WorkOrderFilters, WorkOrderListResult } from '../types';
import { ExecutionEngine } from '@/execution/core/Engines';
import { FinancialEngine } from '@/financial/core/FinancialEngine';

export class WorkOrderRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockDatabase: WorkOrder[] = [
    {
      id: 'wo-4001',
      workOrderNumber: 'WO-20260723-4001',
      serviceRequestId: 'sr-1001',
      ticketNumber: 'SR-20260723-1001',
      title: 'HVAC Start Capacitor & Motor Replacement Execution',
      vendorId: 'usr-vendor-01',
      vendorName: 'Apex Field Services LLC',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      status: 'IN_PROGRESS',
      scheduledAppointment: {
        id: 'app-1',
        startDate: '2026-07-23T09:00:00Z',
        endDate: '2026-07-23T12:00:00Z',
        technicianName: 'Dave Miller (Senior HVAC Tech)',
      },
      tasks: [
        { id: 't1', title: 'Lockout/Tagout Safety Inspection', isCompleted: true, completedAt: '2026-07-23T09:15:00Z' },
        { id: 't2', title: 'Replace 45uF 440V Dual Run Capacitor', isCompleted: true, completedAt: '2026-07-23T10:00:00Z' },
        { id: 't3', title: 'Verify Fan Motor Amperage Draw & Thermal Cutoff', isCompleted: false },
        { id: 't4', title: 'Post-Execution Site Cleanliness Verification', isCompleted: false },
      ],
      progress: ExecutionEngine.evaluate([
        { id: 't1', title: 'Lockout/Tagout Safety Inspection', isCompleted: true },
        { id: 't2', title: 'Replace 45uF 440V Dual Run Capacitor', isCompleted: true },
        { id: 't3', title: 'Verify Fan Motor Amperage Draw & Thermal Cutoff', isCompleted: false },
        { id: 't4', title: 'Post-Execution Site Cleanliness Verification', isCompleted: false },
      ]).progress,
      linkedEntities: [
        { id: 'sr-1001', type: 'SERVICE_REQUEST', label: 'Service Request', referenceNumber: 'SR-20260723-1001', status: 'IN_PROGRESS' },
        { id: 'sur-2001', type: 'SURVEY', label: 'Technical Inspection Survey', referenceNumber: 'SUR-20260723-2001', status: 'APPROVED' },
        { id: 'est-3001', type: 'ESTIMATE', label: 'Approved Quotation Estimate', referenceNumber: 'EST-3001', status: 'APPROVED' },
      ],
      items: [
        { id: 'item-1', description: '45uF 440V Dual Run Capacitor', quantity: 1, unitPrice: 85.0, taxRate: 13, discountAmount: 0 },
        { id: 'item-2', description: 'HVAC Technician Field Labor (2.5 hrs)', quantity: 2.5, unitPrice: 120.0, taxRate: 13, discountAmount: 20 },
      ],
      totals: FinancialEngine.calculate([
        { id: 'item-1', description: '45uF 440V Dual Run Capacitor', quantity: 1, unitPrice: 85.0, taxRate: 13, discountAmount: 0 },
        { id: 'item-2', description: 'HVAC Technician Field Labor (2.5 hrs)', quantity: 2.5, unitPrice: 120.0, taxRate: 13, discountAmount: 20 },
      ]).totals,
      createdAt: '2026-07-23T08:00:00Z',
      updatedAt: '2026-07-23T10:00:00Z',
    },
    {
      id: 'wo-4002',
      workOrderNumber: 'WO-20260722-4002',
      serviceRequestId: 'sr-1002',
      ticketNumber: 'SR-20260722-1002',
      title: 'Commercial Hydro-Jetting Drain Line Clearance',
      vendorId: 'usr-vendor-02',
      vendorName: 'ProPlumb Solutions Inc.',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      status: 'VERIFIED',
      scheduledAppointment: {
        id: 'app-2',
        startDate: '2026-07-22T14:00:00Z',
        endDate: '2026-07-22T17:00:00Z',
        technicianName: 'Bob Vance (Lead Plumber)',
      },
      tasks: [
        { id: 't1', title: 'Hydro-Jetting Pipe Clearance (2000 PSI)', isCompleted: true, completedAt: '2026-07-22T16:00:00Z' },
        { id: 't2', title: 'CCTV Camera Pipe Scope Inspection', isCompleted: true, completedAt: '2026-07-22T16:30:00Z' },
      ],
      progress: ExecutionEngine.evaluate([
        { id: 't1', title: 'Hydro-Jetting Pipe Clearance', isCompleted: true },
        { id: 't2', title: 'CCTV Camera Scope', isCompleted: true },
      ]).progress,
      linkedEntities: [
        { id: 'sr-1002', type: 'SERVICE_REQUEST', label: 'Service Request', referenceNumber: 'SR-20260722-1002', status: 'COMPLETED' },
        { id: 'est-3002', type: 'ESTIMATE', label: 'Approved Quotation Estimate', referenceNumber: 'EST-3002', status: 'APPROVED' },
      ],
      items: [
        { id: 'item-1', description: 'Commercial Hydro-Jetting Service', quantity: 1, unitPrice: 450.0, taxRate: 13, discountAmount: 50 },
      ],
      totals: FinancialEngine.calculate([
        { id: 'item-1', description: 'Commercial Hydro-Jetting Service', quantity: 1, unitPrice: 450.0, taxRate: 13, discountAmount: 50 },
      ]).totals,
      createdAt: '2026-07-22T12:00:00Z',
      updatedAt: '2026-07-22T17:30:00Z',
    },
  ];

  static async listWorkOrders(filters: WorkOrderFilters): Promise<WorkOrderListResult> {
    try {
      const client = this.getClient();
      const res = await client.workOrders.getAllAdmin(filters);
      if (res.data?.items) {
        return {
          items: res.data.items.map((item) => {
            const tasks = item.tasks.map((t) => ({
              id: t.id,
              title: t.title,
              isCompleted: t.isCompleted,
              completedAt: t.completedAt,
            }));
            const evalResult = ExecutionEngine.evaluate(tasks, {
              id: `app-${item.id}`,
              startDate: item.scheduledStartDate || item.createdAt,
              endDate: item.scheduledEndDate || item.createdAt,
              technicianName: item.technicianName || 'Assigned Technician',
            });
            return {
              id: item.id,
              workOrderNumber: item.workOrderNumber,
              serviceRequestId: item.serviceRequestId,
              ticketNumber: item.ticketNumber || 'SR-20260723-1001',
              title: `Work Order ${item.workOrderNumber}`,
              vendorId: item.vendorId,
              vendorName: item.vendorName || 'Assigned Vendor',
              customerId: item.customerId || 'usr-customer-01',
              customerName: item.customerName || 'Customer Account',
              status: item.status as any,
              scheduledAppointment: {
                id: `app-${item.id}`,
                startDate: item.scheduledStartDate || item.createdAt,
                endDate: item.scheduledEndDate || item.createdAt,
                technicianName: item.technicianName || 'Assigned Technician',
              },
              tasks,
              progress: evalResult.progress,
              linkedEntities: [
                { id: item.serviceRequestId, type: 'SERVICE_REQUEST', label: 'Service Request', referenceNumber: item.ticketNumber || 'SR-1001', status: item.status },
                { id: item.estimateId, type: 'ESTIMATE', label: 'Approved Estimate', referenceNumber: `EST-${item.estimateId.slice(-4)}`, status: 'APPROVED' },
              ],
              items: [],
              totals: FinancialEngine.calculate([]).totals,
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
        (wo) =>
          wo.workOrderNumber.toLowerCase().includes(q) ||
          wo.ticketNumber.toLowerCase().includes(q) ||
          wo.title.toLowerCase().includes(q) ||
          wo.vendorName.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      items = items.filter((wo) => wo.status === filters.status);
    }

    const total = items.length;
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginated = items.slice(startIndex, startIndex + filters.pageSize);

    return { items: paginated, total };
  }

  static async getById(id: string): Promise<WorkOrder | null> {
    const found = this.mockDatabase.find((wo) => wo.id === id);
    return found || null;
  }

  static async verifyWorkOrder(id: string, remarks?: string): Promise<WorkOrder> {
    const index = this.mockDatabase.findIndex((wo) => wo.id === id);
    if (index === -1) throw new Error('Work Order not found');

    const updated: WorkOrder = {
      ...this.mockDatabase[index],
      status: 'VERIFIED',
      updatedAt: new Date().toISOString(),
    };
    this.mockDatabase[index] = updated;
    return updated;
  }
}
