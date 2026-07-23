import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorServiceRequest {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  serviceAddress?: string;
  customerName?: string;
  createdAt: string;
  history: Array<{ id: string; description: string; timestamp: string; actor: string }>;
}

export class ServiceRequestRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockAssignedRequests: VendorServiceRequest[] = [
    {
      id: 'sr-1002',
      ticketNumber: 'SR-20260722-1002',
      title: 'Plumbing Main Drain Backup',
      description: 'Commercial kitchen drain line is clogged requiring hydro jetting.',
      category: 'Plumbing',
      priority: 'URGENT',
      status: 'ASSIGNED',
      customerName: 'Jane Doe (Acme Corp)',
      serviceAddress: '100 Industrial Parkway, Dock 2',
      createdAt: '2026-07-22T10:15:00Z',
      history: [
        { id: '1', description: 'Ticket Created', timestamp: '2026-07-22 10:15', actor: 'Jane Doe' },
        { id: '2', description: 'Assigned to Apex Field Services LLC', timestamp: '2026-07-22 11:00', actor: 'System Admin' },
      ],
    },
  ];

  static async getAssignedRequests(): Promise<VendorServiceRequest[]> {
    return [...this.mockAssignedRequests];
  }

  static async acceptAssignment(id: string): Promise<VendorServiceRequest> {
    const index = this.mockAssignedRequests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Request not found');

    const updated = {
      ...this.mockAssignedRequests[index],
      status: 'IN_PROGRESS',
      history: [
        ...this.mockAssignedRequests[index].history,
        { id: `e-${Date.now()}`, description: 'Assignment Accepted & Work Started', timestamp: new Date().toLocaleTimeString(), actor: 'Vendor' },
      ],
    };
    this.mockAssignedRequests[index] = updated;
    return updated;
  }

  static async rejectAssignment(id: string): Promise<VendorServiceRequest> {
    const index = this.mockAssignedRequests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Request not found');

    const updated = {
      ...this.mockAssignedRequests[index],
      status: 'CREATED',
      history: [
        ...this.mockAssignedRequests[index].history,
        { id: `e-${Date.now()}`, description: 'Assignment Rejected', timestamp: new Date().toLocaleTimeString(), actor: 'Vendor' },
      ],
    };
    this.mockAssignedRequests[index] = updated;
    return updated;
  }
}
