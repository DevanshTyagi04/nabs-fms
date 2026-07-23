import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerServiceRequest {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  serviceAddress?: string;
  createdAt: string;
  history: Array<{ id: string; description: string; timestamp: string; actor: string }>;
}

export class ServiceRequestRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockCustomerRequests: CustomerServiceRequest[] = [
    {
      id: 'sr-1001',
      ticketNumber: 'SR-20260723-1001',
      title: 'HVAC Compressor Failure',
      description: 'Main rooftop HVAC compressor unit is tripping circuit breaker intermittently.',
      category: 'HVAC Electrical',
      priority: 'HIGH',
      status: 'CREATED',
      serviceAddress: '742 Evergreen Terrace, Sector 4',
      createdAt: '2026-07-23T07:00:00Z',
      history: [
        { id: '1', description: 'Ticket Submitted', timestamp: '2026-07-23 07:00', actor: 'Jane Doe' },
      ],
    },
  ];

  static async getMyRequests(): Promise<CustomerServiceRequest[]> {
    return [...this.mockCustomerRequests];
  }

  static async createRequest(dto: { title: string; category: string; description: string; priority?: string; serviceAddress?: string }): Promise<CustomerServiceRequest> {
    const newSr: CustomerServiceRequest = {
      id: `sr-${Date.now()}`,
      ticketNumber: `SR-20260723-${Math.floor(1000 + Math.random() * 9000)}`,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      priority: dto.priority || 'MEDIUM',
      status: 'CREATED',
      serviceAddress: dto.serviceAddress || '742 Evergreen Terrace',
      createdAt: new Date().toISOString(),
      history: [
        { id: `e-${Date.now()}`, description: 'Service Ticket Created', timestamp: new Date().toLocaleTimeString(), actor: 'Jane Doe' },
      ],
    };
    this.mockCustomerRequests.unshift(newSr);
    return newSr;
  }

  static async cancelRequest(id: string): Promise<CustomerServiceRequest> {
    const index = this.mockCustomerRequests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Request not found');

    const updated = {
      ...this.mockCustomerRequests[index],
      status: 'CANCELLED',
      history: [
        ...this.mockCustomerRequests[index].history,
        { id: `e-${Date.now()}`, description: 'Ticket Cancelled by Customer', timestamp: new Date().toLocaleTimeString(), actor: 'Jane Doe' },
      ],
    };
    this.mockCustomerRequests[index] = updated;
    return updated;
  }
}
