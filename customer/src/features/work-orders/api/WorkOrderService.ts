import { WorkOrderRepository, CustomerWorkOrder } from './WorkOrderRepository';

export class WorkOrderService {
  static async getCustomerWorkOrders(): Promise<CustomerWorkOrder[]> {
    return WorkOrderRepository.getCustomerWorkOrders();
  }
}
