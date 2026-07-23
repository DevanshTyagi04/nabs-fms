import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorWorkTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface VendorWorkOrder {
  id: string;
  workOrderNumber: string;
  ticketNumber: string;
  title: string;
  status: string;
  scheduledDate: string;
  tasks: VendorWorkTask[];
}

export class WorkOrderRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockVendorWorkOrders: VendorWorkOrder[] = [
    {
      id: 'wo-4001',
      workOrderNumber: 'WO-20260723-4001',
      ticketNumber: 'SR-20260723-1001',
      title: 'HVAC Start Capacitor & Motor Replacement Execution',
      status: 'IN_PROGRESS',
      scheduledDate: '2026-07-23 09:00 AM - 12:00 PM',
      tasks: [
        { id: 't1', title: 'Lockout/Tagout Safety Inspection', isCompleted: true },
        { id: 't2', title: 'Replace 45uF 440V Dual Run Capacitor', isCompleted: true },
        { id: 't3', title: 'Verify Fan Motor Amperage Draw', isCompleted: false },
        { id: 't4', title: 'Post-Execution Site Cleanliness', isCompleted: false },
      ],
    },
  ];

  static async getVendorWorkOrders(): Promise<VendorWorkOrder[]> {
    return [...this.mockVendorWorkOrders];
  }

  static async updateStatus(id: string, status: string): Promise<VendorWorkOrder> {
    const index = this.mockVendorWorkOrders.findIndex((w) => w.id === id);
    if (index === -1) throw new Error('Work Order not found');

    const updated = {
      ...this.mockVendorWorkOrders[index],
      status,
    };
    this.mockVendorWorkOrders[index] = updated;
    return updated;
  }

  static async toggleTask(workOrderId: string, taskId: string): Promise<VendorWorkOrder> {
    const index = this.mockVendorWorkOrders.findIndex((w) => w.id === workOrderId);
    if (index === -1) throw new Error('Work Order not found');

    const wo = this.mockVendorWorkOrders[index];
    const updatedTasks = wo.tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
    const updated = { ...wo, tasks: updatedTasks };
    this.mockVendorWorkOrders[index] = updated;
    return updated;
  }
}
