import { SessionManager } from '@/auth/services/SessionManager';
import { ServiceRequest, ServiceRequestFilters, ServiceRequestListResult, CreateServiceRequestDto } from '../types';

export class ServiceRequestRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockDatabase: ServiceRequest[] = [
    {
      id: 'sr-1001',
      ticketNumber: 'SR-20260723-1001',
      title: 'HVAC Compressor Failure',
      description: 'Main rooftop HVAC compressor unit is tripping circuit breaker intermittently.',
      category: 'HVAC Electrical',
      priority: 'HIGH',
      status: 'CREATED',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      serviceAddress: '742 Evergreen Terrace, Sector 4',
      createdAt: '2026-07-23T07:00:00Z',
      updatedAt: '2026-07-23T07:00:00Z',
      history: [
        {
          id: 'evt-1',
          type: 'STATUS_CHANGE',
          actor: 'Jane Doe',
          timestamp: '2026-07-23 07:00',
          description: 'Service Ticket SR-20260723-1001 Created',
          metadata: { toStatus: 'CREATED' },
        },
      ],
    },
    {
      id: 'sr-1002',
      ticketNumber: 'SR-20260722-1002',
      title: 'Plumbing Main Drain Backup',
      description: 'Commercial kitchen drain line is clogged requiring hydro jetting.',
      category: 'Plumbing',
      priority: 'URGENT',
      status: 'ASSIGNED',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      assignedVendorId: 'usr-vendor-01',
      assignedVendorName: 'Apex Field Services LLC',
      serviceAddress: '100 Industrial Parkway, Dock 2',
      createdAt: '2026-07-22T10:15:00Z',
      updatedAt: '2026-07-22T11:00:00Z',
      history: [
        {
          id: 'evt-1',
          type: 'STATUS_CHANGE',
          actor: 'Jane Doe',
          timestamp: '2026-07-22 10:15',
          description: 'Service Ticket SR-20260722-1002 Created',
          metadata: { toStatus: 'CREATED' },
        },
        {
          id: 'evt-2',
          type: 'ASSIGNMENT',
          actor: 'System Admin',
          timestamp: '2026-07-22 11:00',
          description: 'Assigned to Apex Field Services LLC',
          metadata: { toStatus: 'ASSIGNED' },
        },
      ],
    },
    {
      id: 'sr-1003',
      ticketNumber: 'SR-20260720-1003',
      title: 'Emergency Lighting Inspection',
      description: 'Annual emergency exit battery backup inspection and lamp replacement.',
      category: 'Electrical Safety',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      assignedVendorId: 'usr-vendor-01',
      assignedVendorName: 'Apex Field Services LLC',
      serviceAddress: '55 Commerce Way',
      createdAt: '2026-07-20T08:30:00Z',
      updatedAt: '2026-07-21T16:00:00Z',
      history: [
        {
          id: 'evt-1',
          type: 'STATUS_CHANGE',
          actor: 'Jane Doe',
          timestamp: '2026-07-20 08:30',
          description: 'Ticket Created',
          metadata: { toStatus: 'CREATED' },
        },
        {
          id: 'evt-2',
          type: 'ASSIGNMENT',
          actor: 'System Admin',
          timestamp: '2026-07-20 09:00',
          description: 'Assigned to Apex Field Services LLC',
          metadata: { toStatus: 'ASSIGNED' },
        },
        {
          id: 'evt-3',
          type: 'STATUS_CHANGE',
          actor: 'Apex Services',
          timestamp: '2026-07-21 09:00',
          description: 'Technician on site - Work Started',
          metadata: { toStatus: 'IN_PROGRESS' },
        },
        {
          id: 'evt-4',
          type: 'STATUS_CHANGE',
          actor: 'Apex Services',
          timestamp: '2026-07-21 16:00',
          description: 'Inspection complete and verified',
          metadata: { toStatus: 'COMPLETED' },
        },
      ],
    },
  ];

  static async listRequests(filters: ServiceRequestFilters): Promise<ServiceRequestListResult> {
    try {
      const client = this.getClient();
      const res = await client.serviceRequests.getAllAdmin(filters);
      if (res.data?.items) {
        return {
          items: res.data.items.map((item: any) => ({
            ...item,
            history: item.history ? item.history.map((h: any) => ({
              id: h.id,
              type: 'STATUS_CHANGE',
              actor: 'User',
              timestamp: h.createdAt,
              description: h.remarks || `Status changed to ${h.toStatus}`,
              metadata: { toStatus: h.toStatus },
            })) : [],
          })),
          total: res.data.total,
        };
      }
    } catch {
      // Fallback to pre-seeded dataset
    }

    let items = [...this.mockDatabase];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (sr) =>
          sr.ticketNumber.toLowerCase().includes(q) ||
          sr.title.toLowerCase().includes(q) ||
          sr.category.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      items = items.filter((sr) => sr.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'ALL') {
      items = items.filter((sr) => sr.priority === filters.priority);
    }

    const total = items.length;
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginated = items.slice(startIndex, startIndex + filters.pageSize);

    return { items: paginated, total };
  }

  static async getById(id: string): Promise<ServiceRequest | null> {
    const found = this.mockDatabase.find((sr) => sr.id === id);
    return found || null;
  }

  static async create(dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    const newSr: ServiceRequest = {
      id: `sr-${Date.now()}`,
      ticketNumber: `SR-20260723-${Math.floor(1000 + Math.random() * 9000)}`,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      priority: dto.priority || 'MEDIUM',
      status: 'CREATED',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      serviceAddress: dto.serviceAddress || '742 Evergreen Terrace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `evt-${Date.now()}`,
          type: 'STATUS_CHANGE',
          actor: 'Customer Account',
          timestamp: new Date().toLocaleTimeString(),
          description: 'Service Request Created',
          metadata: { toStatus: 'CREATED' },
        },
      ],
    };

    this.mockDatabase.unshift(newSr);
    return newSr;
  }

  static async assignVendor(id: string, vendorId: string, vendorName: string, notes?: string): Promise<ServiceRequest> {
    const index = this.mockDatabase.findIndex((sr) => sr.id === id);
    if (index === -1) throw new Error('Request not found');

    const updated: ServiceRequest = {
      ...this.mockDatabase[index],
      assignedVendorId: vendorId,
      assignedVendorName: vendorName,
      status: 'ASSIGNED',
      updatedAt: new Date().toISOString(),
      history: [
        ...this.mockDatabase[index].history,
        {
          id: `evt-${Date.now()}`,
          type: 'ASSIGNMENT',
          actor: 'System Admin',
          timestamp: new Date().toLocaleTimeString(),
          description: `Assigned to ${vendorName}${notes ? `: ${notes}` : ''}`,
          metadata: { toStatus: 'ASSIGNED' },
        },
      ],
    };

    this.mockDatabase[index] = updated;
    return updated;
  }

  static async changeStatus(id: string, status: any, remarks?: string): Promise<ServiceRequest> {
    const index = this.mockDatabase.findIndex((sr) => sr.id === id);
    if (index === -1) throw new Error('Request not found');

    const updated: ServiceRequest = {
      ...this.mockDatabase[index],
      status,
      updatedAt: new Date().toISOString(),
      history: [
        ...this.mockDatabase[index].history,
        {
          id: `evt-${Date.now()}`,
          type: 'STATUS_CHANGE',
          actor: 'User Action',
          timestamp: new Date().toLocaleTimeString(),
          description: remarks || `Status changed to ${status}`,
          metadata: { toStatus: status },
        },
      ],
    };

    this.mockDatabase[index] = updated;
    return updated;
  }
}
