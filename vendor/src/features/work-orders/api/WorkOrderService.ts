import { WorkOrderRepository, VendorWorkOrder } from './WorkOrderRepository';

export class WorkOrderService {
  static async getVendorWorkOrders(): Promise<VendorWorkOrder[]> {
    return WorkOrderRepository.getVendorWorkOrders();
  }

  static async updateStatus(id: string, status: string): Promise<VendorWorkOrder> {
    return WorkOrderRepository.updateStatus(id, status);
  }

  static async toggleTask(workOrderId: string, taskId: string): Promise<VendorWorkOrder> {
    return WorkOrderRepository.toggleTask(workOrderId, taskId);
  }
}
