import { SessionManager } from '@/auth/services/SessionManager';
import { Survey, SurveyFilters, SurveyListResult, ReviewSurveyDto } from '../types';
import { FormDefinition } from '@/forms/engine/types';

export class SurveyRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static defaultFormDefinition: FormDefinition = {
    id: 'form-survey-v1',
    version: 1,
    title: 'Field Technical Inspection Form',
    description: 'Standard technical assessment and safety verification protocol',
    sections: [
      {
        id: 'sec-1',
        title: 'Section 1: Initial Safety & Environmental Check',
        fields: [
          {
            id: 'item-1',
            name: 'breaker_status',
            label: 'Main Electrical Breaker & Disconnect Status',
            type: 'dropdown',
            options: [
              { label: 'Pass - De-energized & Locked', value: 'PASS' },
              { label: 'Fail - Unsafe wiring detected', value: 'FAIL' },
              { label: 'N/A', value: 'NA' },
            ],
            validation: { required: true },
          },
          {
            id: 'item-2',
            name: 'hvac_rating',
            label: 'Compressor Motor Mechanical Rating',
            type: 'rating',
            validation: { required: true },
          },
        ],
      },
      {
        id: 'sec-2',
        title: 'Section 2: Component Diagnostics & Photos',
        fields: [
          {
            id: 'item-3',
            name: 'diagnostic_notes',
            label: 'Diagnostic Inspection Notes & Recommendations',
            type: 'textarea',
            placeholder: 'Detail motor coil resistance, capacitor readings...',
            validation: { required: true },
          },
          {
            id: 'item-4',
            name: 'photo_proof',
            label: 'Upload Inspection Evidence Photo',
            type: 'photo',
          },
        ],
      },
    ],
  };

  private static mockDatabase: Survey[] = [
    {
      id: 'srv-2001',
      serviceRequestId: 'sr-1001',
      ticketNumber: 'SR-20260723-1001',
      title: 'HVAC Technical Assessment Survey',
      vendorId: 'usr-vendor-01',
      vendorName: 'Apex Field Services LLC',
      status: 'SUBMITTED',
      version: 1,
      notes: 'Compressor start capacitor swollen and blown. Replacement required.',
      items: [
        { id: 'item-1', title: 'Main Electrical Breaker', fieldType: 'dropdown', value: 'PASS', isRequired: true },
        { id: 'item-2', title: 'Compressor Rating', fieldType: 'rating', rating: 4, isRequired: true },
        { id: 'item-3', title: 'Diagnostic Notes', fieldType: 'textarea', value: 'Capacitor reading 0 uF vs 45 uF spec.', isRequired: true },
        { id: 'item-4', title: 'Inspection Photo', fieldType: 'photo', photoUrl: 'https://storage.nabs.com/uploads/photo1.jpg', isRequired: false },
      ],
      formDefinition: SurveyRepository.defaultFormDefinition,
      responses: {
        'item-1': 'PASS',
        'item-2': 4,
        'item-3': 'Capacitor reading 0 uF vs 45 uF spec.',
        'item-4': 'https://storage.nabs.com/uploads/photo1.jpg',
      },
      createdAt: '2026-07-23T09:00:00Z',
      updatedAt: '2026-07-23T09:30:00Z',
    },
    {
      id: 'srv-2002',
      serviceRequestId: 'sr-1002',
      ticketNumber: 'SR-20260722-1002',
      title: 'Plumbing Drain Line Inspection',
      vendorId: 'usr-vendor-02',
      vendorName: 'ProPlumb Solutions Inc.',
      status: 'APPROVED',
      version: 1,
      notes: 'Line cleared with hydro-jetting. Camera snake verified no root intrusion.',
      items: [
        { id: 'item-1', title: 'Main Line Flow Check', fieldType: 'dropdown', value: 'PASS', isRequired: true },
        { id: 'item-2', title: 'Drain Cleanliness Rating', fieldType: 'rating', rating: 5, isRequired: true },
      ],
      formDefinition: SurveyRepository.defaultFormDefinition,
      responses: {
        'item-1': 'PASS',
        'item-2': 5,
      },
      createdAt: '2026-07-22T14:00:00Z',
      updatedAt: '2026-07-22T16:00:00Z',
    },
  ];

  static async listSurveys(filters: SurveyFilters): Promise<SurveyListResult> {
    try {
      const client = this.getClient();
      const res = await client.surveys.getAllAdmin(filters);
      if (res.data?.items) {
        return {
          items: res.data.items.map((item) => ({
            id: item.id,
            serviceRequestId: item.serviceRequestId,
            ticketNumber: item.ticketNumber || 'SR-20260723-1001',
            title: `Technical Survey #${item.id.slice(-4)}`,
            vendorId: item.vendorId,
            vendorName: item.vendorName || 'Assigned Vendor',
            status: item.status as any,
            version: item.version,
            notes: item.notes,
            items: item.items.map((i) => ({
              id: i.id,
              title: i.title,
              fieldType: i.fieldType,
              value: i.value,
              rating: i.rating,
              photoUrl: i.photoUrl,
              isRequired: i.isRequired,
            })),
            formDefinition: this.defaultFormDefinition,
            responses: item.items.reduce((acc: any, i) => {
              acc[i.id] = i.value || i.rating;
              return acc;
            }, {}),
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
          total: res.data.total,
        };
      }
    } catch {
      // Fallback
    }

    let items = [...this.mockDatabase];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (s) =>
          s.ticketNumber.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.vendorName.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      items = items.filter((s) => s.status === filters.status);
    }

    const total = items.length;
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginated = items.slice(startIndex, startIndex + filters.pageSize);

    return { items: paginated, total };
  }

  static async getById(id: string): Promise<Survey | null> {
    const found = this.mockDatabase.find((s) => s.id === id);
    return found || null;
  }

  static async reviewSurvey(id: string, dto: ReviewSurveyDto): Promise<Survey> {
    const index = this.mockDatabase.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Survey not found');

    const updated: Survey = {
      ...this.mockDatabase[index],
      status: dto.status,
      updatedAt: new Date().toISOString(),
    };

    this.mockDatabase[index] = updated;
    return updated;
  }
}
