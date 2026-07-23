import { SurveyRepository, VendorSurvey } from './SurveyRepository';

export class SurveyService {
  static async getVendorSurveys(): Promise<VendorSurvey[]> {
    return SurveyRepository.getVendorSurveys();
  }

  static async submitSurvey(id: string, rating: number, notes: string): Promise<VendorSurvey> {
    return SurveyRepository.submitSurvey(id, rating, notes);
  }
}
