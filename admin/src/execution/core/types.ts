export interface WorkTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Appointment {
  id: string;
  startDate: string;
  endDate: string;
  technicianName?: string;
  location?: string;
}

export interface LinkedEntity {
  id: string;
  type: 'SERVICE_REQUEST' | 'SURVEY' | 'ESTIMATE' | 'INVOICE' | 'PAYMENT';
  label: string;
  referenceNumber: string;
  status: string;
}

export interface ExecutionProgress {
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  isComplete: boolean;
}
