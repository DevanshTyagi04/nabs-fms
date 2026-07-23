import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerWorkOrder {
  id: string;
  workOrderNumber: string;
  ticketNumber: string;
  title: string;
  vendorName: string;
  status: string;
  scheduledDate: string;
  percentage: number;
  completedTasks: number;
  totalTasks: number;
  grandTotal: number;
}

export class WorkOrderRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockCustomerWorkOrders: CustomerWorkOrder[] = [
    {
      id: 'wo-4001',
      workOrderNumber: 'WO-20260723-4001',
      ticketNumber: 'SR-20260723-1001',
      title: 'HVAC Start Capacitor & Motor Replacement Execution',
      vendorName: 'Apex Field Services LLC',
      status: 'IN_PROGRESS',
      scheduledDate: '2026-07-23 09:00 AM - 12:00 PM',
      percentage: 50,
      completedTasks: 2,
      totalTasks: 4,
      grandTotal: 412.45,
    },
  ];

  static async getCustomerWorkOrders(): Promise<CustomerWorkOrder[]> {
    return [...this.mockCustomerWorkOrders];
  }
}
