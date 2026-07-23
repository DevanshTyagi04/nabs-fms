import { WorkOrderRepository } from './WorkOrderRepository';
import { WorkOrder, WorkOrderFilters, WorkOrderListResult } from '../types';

export class WorkOrderService {
  static async listWorkOrders(filters: WorkOrderFilters): Promise<WorkOrderListResult> {
    return WorkOrderRepository.listWorkOrders(filters);
  }

  static async getById(id: string): Promise<WorkOrder | null> {
    return WorkOrderRepository.getById(id);
  }

  static async verifyWorkOrder(id: string, remarks?: string): Promise<WorkOrder> {
    return WorkOrderRepository.verifyWorkOrder(id, remarks);
  }
}
