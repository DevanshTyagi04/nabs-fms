import { SurveyRepository, CustomerSurvey } from './SurveyRepository';

export class SurveyService {
  static async getCustomerSurveys(): Promise<CustomerSurvey[]> {
    return SurveyRepository.getCustomerSurveys();
  }
}
