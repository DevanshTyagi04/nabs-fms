import { WorkTask, Appointment, LinkedEntity, ExecutionProgress } from '@/execution/core/types';
import { FinancialLineItem, TotalsBreakdown } from '@/financial/core/types';

export type WorkOrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'CANCELLED';

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  serviceRequestId: string;
  ticketNumber: string;
  title: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  status: WorkOrderStatus;
  scheduledAppointment?: Appointment;
  tasks: WorkTask[];
  progress: ExecutionProgress;
  linkedEntities: LinkedEntity[];
  items: FinancialLineItem[];
  totals: TotalsBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderFilters {
  search?: string;
  status?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WorkOrderListResult {
  items: WorkOrder[];
  total: number;
}
