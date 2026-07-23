import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorSurvey {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  version: number;
  rating: number;
  notes: string;
  createdAt: string;
}

export class SurveyRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockVendorSurveys: VendorSurvey[] = [
    {
      id: 'srv-2001',
      ticketNumber: 'SR-20260723-1001',
      title: 'HVAC Technical Assessment Survey',
      status: 'SUBMITTED',
      version: 1,
      rating: 4,
      notes: 'Compressor start capacitor swollen and blown. Replacement required.',
      createdAt: '2026-07-23T09:00:00Z',
    },
  ];

  static async getVendorSurveys(): Promise<VendorSurvey[]> {
    return [...this.mockVendorSurveys];
  }

  static async submitSurvey(id: string, rating: number, notes: string): Promise<VendorSurvey> {
    const index = this.mockVendorSurveys.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Survey not found');

    const updated = {
      ...this.mockVendorSurveys[index],
      status: 'SUBMITTED',
      rating,
      notes,
    };
    this.mockVendorSurveys[index] = updated;
    return updated;
  }
}
