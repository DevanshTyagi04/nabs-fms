import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerSurvey {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  rating: number;
  notes: string;
  createdAt: string;
}

export class SurveyRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockCustomerSurveys: CustomerSurvey[] = [
    {
      id: 'srv-2002',
      ticketNumber: 'SR-20260722-1002',
      title: 'Plumbing Drain Line Inspection',
      status: 'APPROVED',
      rating: 5,
      notes: 'Line cleared with hydro-jetting. Camera snake verified no root intrusion.',
      createdAt: '2026-07-22T14:00:00Z',
    },
  ];

  static async getCustomerSurveys(): Promise<CustomerSurvey[]> {
    return [...this.mockCustomerSurveys];
  }
}
